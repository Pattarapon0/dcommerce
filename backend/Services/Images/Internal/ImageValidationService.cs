using backend.Common.Config;
using backend.Common.Results;
using LanguageExt;
using Microsoft.Extensions.Options;
using static LanguageExt.Prelude;

namespace backend.Services.Images.Internal;

public class ImageValidationService(IOptions<ImageUploadOptions> options, HttpClient httpClient, ILogger<ImageValidationService> logger) : IImageValidationService
{
    private readonly ImageUploadOptions _options = options.Value;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<ImageValidationService> _logger = logger;

    public bool IsValidExtension(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return false;

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return _options.AllowedExtensions.Contains(extension);
    }

    public string GetMimeType(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return "application/octet-stream";

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        
        return extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }

    public bool IsValidFileSize(long sizeBytes)
    {
        return sizeBytes > 0 && sizeBytes <= _options.MaxFileSizeBytes;
    }

    public async Task<Fin<bool>> VerifyImageContentAsync(string url)
    {
        try
        {
            using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to verify image content, HTTP {StatusCode}: {Url}", response.StatusCode, url);
                return FinFail<bool>(ServiceError.ImageNotFound(url));
            }
                
            // 1. Check content-type header first
            var contentType = response.Content.Headers.ContentType?.MediaType;
            if (string.IsNullOrEmpty(contentType) || !_options.AllowedMimeTypes.Contains(contentType))
            {
                _logger.LogWarning("Invalid content type {ContentType} for image: {Url}", contentType, url);
                return FinSucc(false); // Invalid type - will trigger deletion
            }
                
            // 2. Check content length
            var contentLength = response.Content.Headers.ContentLength;
            if (contentLength.HasValue && !IsValidFileSize(contentLength.Value))
            {
                _logger.LogWarning("Invalid file size {Size} bytes for image: {Url}", contentLength.Value, url);
                return FinSucc(false); // Invalid size - will trigger deletion
            }
                
            // 3. Check magic bytes for actual file content
            using var stream = await response.Content.ReadAsStreamAsync();
            var buffer = new byte[12];
            var bytesRead = await stream.ReadAsync(buffer, 0, 12);
            
            if (bytesRead < 4) // Need at least 4 bytes for magic signature
            {
                _logger.LogWarning("Insufficient bytes read ({BytesRead}) for magic signature check: {Url}", bytesRead, url);
                return FinSucc(false); // Invalid file - will trigger deletion
            }
                
            var hasValidSignature = HasValidImageSignature(buffer);
            if (!hasValidSignature)
            {
                _logger.LogWarning("Invalid image signature for: {Url}", url);
            }
            
            return FinSucc(hasValidSignature);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error verifying image content: {Url}", url);
            return FinFail<bool>(ServiceError.StorageServiceUnavailable());
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "Timeout verifying image content: {Url}", url);
            return FinFail<bool>(ServiceError.StorageServiceUnavailable());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error verifying image content: {Url}", url);
            return FinFail<bool>(ServiceError.StorageServiceUnavailable());
        }
    }

    public bool HasValidImageSignature(byte[] bytes)
    {
        if (bytes.Length < 4) return false;
        
        // JPEG: FF D8 FF
        if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            return true;
            
        // PNG: 89 50 4E 47
        if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            return true;
            
        // WebP: 52 49 46 46 (RIFF) + WEBP at offset 8
        if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 &&
            bytes.Length >= 12 && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50)
            return true;
            
        // GIF: 47 49 46 38 (GIF8)
        if (bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x38)
            return true;
            
        return false; // Unknown/invalid format
    }
}