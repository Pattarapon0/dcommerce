using System.Runtime.InteropServices;
using backend.Common.Config;
using backend.Common.Results;
using backend.Services.Images.Internal;
using LanguageExt;
using Microsoft.Extensions.Options;
using static LanguageExt.Prelude;

namespace backend.Services.Images;

public class ImageService(
    IR2Service r2Service,
    IImageValidationService validation,
    IRateLimitService rateLimit,
    IOptions<ImageKitOptions> imageKitOptions,
    IOptions<ImageUploadOptions> uploadOptions,
    IOptions<R2Options> r2Options,
    ILogger<ImageService> logger) : IImageService
{
    private readonly IR2Service _r2Service = r2Service;
    private readonly IImageValidationService _validation = validation;
    private readonly IRateLimitService _rateLimit = rateLimit;
    private readonly ImageKitOptions _imageKitOptions = imageKitOptions.Value;
    private readonly ImageUploadOptions _uploadOptions = uploadOptions.Value;
    private readonly ILogger<ImageService> _logger = logger;

    private readonly R2Options _r2Options = r2Options.Value;
    public async Task<Fin<string>> GenerateUploadUrlAsync(string fileName, Guid sellerId)
    {
        try
        {
            // 1. Rate limit check
            var rateLimitKey = $"upload_{sellerId}";
            var isAllowed = await _rateLimit.IsAllowedAsync(rateLimitKey, _uploadOptions.MaxUploadsPerMinute, TimeSpan.FromMinutes(1));
            if (!isAllowed)
            {
                _logger.LogWarning("Rate limit exceeded for seller: {SellerId}", sellerId);
                return FinFail<string>(ServiceError.ImageUploadRateLimit());
            }

            // 2. Validate file extension
            if (!_validation.IsValidExtension(fileName))
            {
                _logger.LogWarning("Invalid file extension for: {FileName}", fileName);
                return FinFail<string>(ServiceError.InvalidImageFormat(fileName));
            }

            // 3. Generate unique key for direct upload to final location
            var uniqueKey = $"products/{sellerId}/{Guid.NewGuid()}_{fileName}";
            var contentType = _validation.GetMimeType(fileName);

            // 4. Generate pre-signed URL with content-type enforcement
            var result = await _r2Service.GeneratePreSignedUploadUrlAsync(
                uniqueKey,
                contentType,
                _uploadOptions.MaxFileSizeBytes,
                _uploadOptions.PreSignedUrlExpiry
            );

            if (result.IsSucc)
            {
                _logger.LogInformation("Generated upload URL for seller {SellerId}, file: {FileName}", sellerId, fileName);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating upload URL for seller {SellerId}, file: {FileName}", sellerId, fileName);
            return FinFail<string>(ServiceError.Internal($"Failed to generate upload URL: {ex.Message}"));
        }
    }

    public async Task<Fin<string>> ConfirmUploadAsync(string r2Url, Guid sellerId)
    {
        var key = ExtractKeyFromUrl(r2Url);
        
        try
        {
            // 1. Verify the upload actually happened
            var exists = await _r2Service.ObjectExistsAsync(key);
            if (exists.IsFail)
                return exists.BiMap(_ => "", err => err);
            
            var objectExists = exists.Match(
                Succ: exists => exists,
                Fail: _ => false
            );

            if (!objectExists)
            {
                _logger.LogWarning("Object not found during confirmation: {Key}", key);
                return FinFail<string>(ServiceError.ImageNotFound(r2Url));
            }
            
            // 2. Verify ownership (check key contains sellerId)
            if (!key.Contains(sellerId.ToString()))
            {
                _logger.LogWarning("Unauthorized file access attempt by seller {SellerId}: {Key}", sellerId, key);
                await _r2Service.DeleteObjectAsync(key); // Delete unauthorized file
                return FinFail<string>(ServiceError.PermissionDenied("Invalid file ownership"));
            }
            
            // 3. Verify file size (in case client bypassed validation)
            var metadata = await _r2Service.GetObjectMetadataAsync(key);
            if (metadata.IsFail)
            {
                _logger.LogError("Failed to get metadata for key: {Key}", key);
                return metadata.BiMap(_ => "", err => err);
            }
            var metadataValue = metadata.Match(
                Succ: value => value,
                Fail: _ => new ObjectMetadata(0, "unknown", DateTime.UtcNow)
            );

            if (metadata.IsSucc && !_validation.IsValidFileSize(metadataValue.Size))
            {
                _logger.LogWarning("File size validation failed for: {Key}, size: {Size}", key, metadataValue.Size);
                await _r2Service.DeleteObjectAsync(key); // Delete oversized file
                return FinFail<string>(ServiceError.ImageTooLarge(metadataValue.Size));
            }
            
            // 4. Verify the file is actually a valid image (magic bytes + content-type)
            var publicUrl = _r2Service.GetPublicUrl(key);
            var isValidImage = await _validation.VerifyImageContentAsync(publicUrl);
            if (isValidImage.IsFail)
            {
                await _r2Service.DeleteObjectAsync(key); // Cleanup on validation error
                return isValidImage.BiMap(_ => "", err => err);
            }
            
            var isValidImageValue = isValidImage.Match(
                Succ: value => value,
                Fail: _ => false
            );
            if (!isValidImageValue)
            {
                _logger.LogWarning("Image content validation failed for: {Key}", key);
                await _r2Service.DeleteObjectAsync(key); // Delete invalid image file
                return FinFail<string>(ServiceError.InvalidImageContent());
            }
            
            // 5. All validations passed - convert to ImageKit URL
            var imageKitUrl = ConvertToImageKitUrl(publicUrl);
            
            _logger.LogInformation("Successfully confirmed upload for seller {SellerId}: {Key}", sellerId, key);
            return FinSucc(imageKitUrl);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error confirming upload for seller {SellerId}: {Key}", sellerId, key);
            
            // Cleanup on any error
            try 
            {
                await _r2Service.DeleteObjectAsync(key);
                _logger.LogInformation("Cleaned up file after error: {Key}", key);
            }
            catch (Exception cleanupEx)
            {
                _logger.LogError(cleanupEx, "Failed to cleanup file after error: {Key}", key);
            }
            
            return FinFail<string>(ServiceError.StorageServiceUnavailable());
        }
    }

    public async Task<Fin<Unit>> DeleteImageAsync(string imageUrl)
    {
        try
        {
            // Convert ImageKit URL back to R2 URL
            var r2Url = ConvertImageKitToR2Url(imageUrl);
            var key = ExtractKeyFromUrl(r2Url);
            
            var result = await _r2Service.DeleteObjectAsync(key);
            
            if (result.IsSucc)
            {
                _logger.LogInformation("Successfully deleted image: {ImageUrl}", imageUrl);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting image: {ImageUrl}", imageUrl);
            return FinFail<Unit>(ServiceError.StorageServiceUnavailable());
        }
    }

    public string ConvertToImageKitUrl(string r2Url)
    {
        if (string.IsNullOrEmpty(r2Url) || string.IsNullOrEmpty(_imageKitOptions.UrlEndpoint))
            return r2Url;
            
        try
        {
            var r2Uri = new Uri(r2Url);
            var path = r2Uri.AbsolutePath;
            
            return $"{_imageKitOptions.UrlEndpoint.TrimEnd('/')}{path}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to convert R2 URL to ImageKit URL: {R2Url}", r2Url);
            return r2Url; // Return original URL if conversion fails
        }
    }

    public string GetTransformedImageUrl(string imageUrl, int? width = null, int? height = null)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return imageUrl;
            
        try
        {
            var transformations = new List<string>();
            
            if (width.HasValue)
                transformations.Add($"w-{width.Value}");
                
            if (height.HasValue)
                transformations.Add($"h-{height.Value}");
                
            if (transformations.Count == 0)
                return imageUrl;
                
            var transformString = string.Join(",", transformations);
            var separator = imageUrl.Contains("?") ? "&" : "?";
            
            return $"{imageUrl}{separator}tr={transformString}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate transformed URL for: {ImageUrl}", imageUrl);
            return imageUrl; // Return original URL if transformation fails
        }
    }

   /* public async Task<Fin<Unit>> CleanupAbandonedUploadsAsync()
    {
        try
        {
            // This would require listing objects in R2, which we haven't implemented yet
            // For MVP, we'll return success
            _logger.LogInformation("Cleanup abandoned uploads called (not implemented in MVP)");
            return FinSucc(Unit.Default);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup of abandoned uploads");
            return FinFail<Unit>(ServiceError.Internal($"Cleanup failed: {ex.Message}"));
        }
    }*/

    private string ExtractKeyFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            return uri.AbsolutePath.TrimStart('/');
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to extract key from URL: {Url}", url);
            throw new ArgumentException($"Invalid URL format: {url}", nameof(url));
        }
    }

    private string ConvertImageKitToR2Url(string imageKitUrl)
    {
        if (string.IsNullOrEmpty(imageKitUrl) || string.IsNullOrEmpty(_imageKitOptions.UrlEndpoint))
            return imageKitUrl;
            
        try
        {
            var imageKitUri = new Uri(imageKitUrl);
            var path = imageKitUri.AbsolutePath;
            
            // Get R2 public URL from options (would need to add this to R2Options)
            // For now, we'll assume we can reconstruct it
            return $"{_r2Options.PublicUrl.TrimEnd('/')}{path}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to convert ImageKit URL to R2 URL: {ImageKitUrl}", imageKitUrl);
            return imageKitUrl; // Return original URL if conversion fails
        }
    }
}