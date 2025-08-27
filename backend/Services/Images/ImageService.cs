using System.Runtime.InteropServices;
using backend.Common.Config;
using backend.Common.Results;
using backend.Services.Images.Internal;
using LanguageExt;
using Microsoft.Extensions.Options;
using static LanguageExt.Prelude;
using backend.Common.Models;
using backend.DTO.Products;
using LanguageExt.Pretty;

namespace backend.Services.Images;

public class ImageService(
    IR2Service r2Service,
    IImageValidationService validation,
    IRateLimitService rateLimit,
    IOptions<ImageKitOptions> imageKitOptions,
    IOptions<ImageUploadOptions> uploadOptions,
    IOptions<R2Options> r2Options,
    HttpClient httpClient,
    ILogger<ImageService> logger) : IImageService
{
    private readonly IR2Service _r2Service = r2Service;
    private readonly IImageValidationService _validation = validation;
    private readonly IRateLimitService _rateLimit = rateLimit;
    private readonly ImageKitOptions _imageKitOptions = imageKitOptions.Value;
    private readonly ImageUploadOptions _uploadOptions = uploadOptions.Value;
    private readonly ILogger<ImageService> _logger = logger;
    private readonly HttpClient _httpClient = httpClient;

    private readonly R2Options _r2Options = r2Options.Value;



    public async Task<Fin<string>> GenerateUploadUrlAsync(string fileName, Guid ownerId, string objectType = "product")
    {
        // 1. Rate limit check
        var rateLimitKey = $"upload_{ownerId}";
        var isAllowed = await _rateLimit.IsAllowedAsync(rateLimitKey, _uploadOptions.MaxUploadsPerMinute, TimeSpan.FromMinutes(1));
        if (!isAllowed)
        {
            return FinFail<string>(ServiceError.ImageUploadRateLimit());
        }

        // 2. Validate file extension
        if (!_validation.IsValidExtension(fileName))
        {
            return FinFail<string>(ServiceError.InvalidImageFormat(fileName));
        }

        // 3. Determine max file size based on objectType using config
        var maxFileSize = objectType switch
        {
            "profiles" => _uploadOptions.MaxFileSizeBytes,
            "seller-profiles" => _uploadOptions.MaxFileSizeBytes,
            "product" => _uploadOptions.ProductMaxFileSizeBytes,
            _ => _uploadOptions.ProductMaxFileSizeBytes // Default to product
        };

        // 4. Generate unique key for direct upload to final location
        var uniqueKey = $"{objectType}/{ownerId}/{Guid.NewGuid()}_{fileName}";
        var contentType = _validation.GetMimeType(fileName);

        // 5. Generate pre-signed URL with type-specific content-type and size enforcement
        var result = await _r2Service.GeneratePreSignedUploadUrlAsync(
            uniqueKey,
            contentType,
            maxFileSize,
            _uploadOptions.PreSignedUrlExpiry
        );

        return result;
    }

    public async Task<Fin<BatchUploadUrlResponse>> GenerateBatchUploadUrlsAsync(List<string> fileNames, Guid ownerId, string objectType = "product")
    {
        // 1. Rate limit check for batch requests
        var rateLimitKey = $"batch_upload_{ownerId}";
        var isAllowed = await _rateLimit.IsAllowedAsync(rateLimitKey, _uploadOptions.ProductBatchRequestsPerMinute, TimeSpan.FromMinutes(1));
        if (!isAllowed)
        {
            return FinFail<BatchUploadUrlResponse>(ServiceError.ImageUploadRateLimit());
        }

        // 2. Check batch size limit
        if (fileNames.Count > _uploadOptions.MaxFilesPerBatch)
        {
            return FinFail<BatchUploadUrlResponse>(ServiceError.Internal($"Batch size exceeds limit of {_uploadOptions.MaxFilesPerBatch} files"));
        }

        // 3. Determine max file size based on objectType
        var maxFileSize = objectType switch
        {
            "profiles" => _uploadOptions.MaxFileSizeBytes,
            "seller-profiles" => _uploadOptions.MaxFileSizeBytes,
            "product" => _uploadOptions.ProductMaxFileSizeBytes,
            _ => _uploadOptions.ProductMaxFileSizeBytes
        };

        // 4. Validate all files first (all-or-nothing validation)
        var validationResults = new List<UploadUrlResult>();
        foreach (var fileName in fileNames)
        {
            if (!_validation.IsValidExtension(fileName))
            {
                validationResults.Add(new UploadUrlResult
                {
                    FileName = fileName,
                    Success = false,
                    ErrorMessage = $"Invalid file extension: {fileName}"
                });
            }
            else
            {
                validationResults.Add(new UploadUrlResult
                {
                    FileName = fileName,
                    Success = true
                });
            }
        }

        // 5. If any validation failed, return HTTP 400 with position-based error message
        if (validationResults.Any(r => !r.Success))
        {
            var failedFiles = validationResults
                .Select((result, index) => new { result, index })
                .Where(x => !x.result.Success)
                .ToList();

            var failedPositions = string.Join(", ", failedFiles.Select(f => $"#{f.index + 1}"));

            return FinFail<BatchUploadUrlResponse>(
                ServiceError.BatchValidationFailed($"Invalid files at positions: {failedPositions}")
            );
        }

        // 6. All files valid - generate URLs in parallel
        var tasks = fileNames.Select(async fileName =>
        {
            try
            {
                var uniqueKey = $"{objectType}/{ownerId}/{Guid.NewGuid()}_{fileName}";
                var contentType = _validation.GetMimeType(fileName);

                var result = await _r2Service.GeneratePreSignedUploadUrlAsync(
                    uniqueKey, contentType, maxFileSize, _uploadOptions.PreSignedUrlExpiry);

                return new UploadUrlResult
                {
                    FileName = fileName,
                    UploadUrl = result.IsSucc ? result.IfFail("") : null,
                    Success = result.IsSucc,
                    ErrorMessage = result.IsSucc ? null : result.IfFail(err => err.Message)
                };
            }
            catch (Exception ex)
            {
                return new UploadUrlResult
                {
                    FileName = fileName,
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        });

        var urlResults = await Task.WhenAll(tasks);

        // 7. If any URL generation failed, return results with NO URLs (all-or-nothing)
        if (urlResults.Any(r => !r.Success))
        {
            foreach (var result in urlResults)
            {
                result.UploadUrl = null;
            }
        }

        return FinSucc(new BatchUploadUrlResponse { Results = [.. urlResults], MaxFileSize = _uploadOptions.ProductMaxFileSizeBytes, AllowedTypes = _uploadOptions.AllowedMimeTypes });
    }

    public Task<Fin<string>> ConfirmUploadAsync(string r2Url, Guid ownerId)
    {
        return FinT<IO, string>.Lift(ExtractKeyFromUrl(r2Url))
        .Bind(key => FinT<IO, bool>.Lift(liftIO(() => _r2Service.ObjectExistsAsync(key)))
        .Bind(exists => exists ? key : FinFail<string>(ServiceError.InvalidImageUrl(r2Url))))
        .Bind<string>(key => !key.Contains(ownerId.ToString())
            ? liftIO(() => _r2Service.DeleteObjectAsync(key)).Map(_ => FinFail<string>(ServiceError.PermissionDenied("Invalid file ownership")))
            : FinSucc(key))
        .Bind(key => FinT<IO, ObjectMetadata>.Lift(liftIO(() => _r2Service.GetObjectMetadataAsync(key)))
                        .Bind<string>(metadata =>
                        {
                            // Extract objectType from key path and determine validation type
                            var objectType = key.Split('/')[0];
                            var validationType = objectType switch
                            {
                                "profiles" => ImageValidationType.Avatar,
                                "seller-profiles" => ImageValidationType.SellerProfile,
                                "product" => ImageValidationType.Product,
                                _ => ImageValidationType.Product
                            };

                            return !_validation.IsValidFileSize(metadata.Size, validationType)
                                ? liftIO(() => _r2Service.DeleteObjectAsync(key)).Map(_ => FinFail<string>(ServiceError.ImageTooLarge(metadata.Size)))
                                : FinSucc(key);
                        }))
        .Map<(string, string)>(key => (_r2Service.GetPublicUrl(key), key))
        .Bind(tuple => FinT<IO, bool>.Lift(liftIO(() => _validation.VerifyImageContentAsync(tuple.Item1)))
                        .Bind<string>(isValidImage => isValidImage
                            ? FinSucc(tuple.Item1)
                            : liftIO(() => _r2Service.DeleteObjectAsync(tuple.Item2)).Map(_ => FinFail<string>(ServiceError.InvalidImageContent()))))
        .Bind(url => FinT<IO, string>.Lift(ExtractKeyFromUrl(url))
                        .Bind(key =>
                        {
                            // Extract objectType from key path (e.g., "profiles/userId/..." or "product/userId/...")
                            var objectType = key.Split('/')[0];
                            return FinT<IO, Stream>.Lift(liftIO(async () =>
                            {
                                var response = await _httpClient.GetAsync(url);
                                return await response.Content.ReadAsStreamAsync();
                            }))
                            .Bind(stream => FinT<IO, ImageValidationResult>.Lift(liftIO(() => _validation.ValidateImageAsync(stream, objectType))))
                            .Bind<string>(validationResult => validationResult.IsValid
                                ? FinSucc(url)
                                : liftIO<Fin<Unit>>(() => _r2Service.DeleteObjectAsync(key)).Map<Fin<string>>(_ => FinFail<string>(ServiceError.Internal($"Image validation failed: {string.Join(", ", validationResult.Errors)}"))));
                        }))
        .Map(ConvertToImageKitUrl).Run().Run().AsTask();
    }

    public async Task<Fin<string[]>> ConfirmBatchUploadAsync(string[] urls, Guid ownerId)
    {
        var r2UrlsToValidate = new List<(string url, int index)>();

        // First pass: identify R2 URLs and their positions
        for (int i = 0; i < urls.Length; i++)
        {
            var url = urls[i];
            if (IsR2Url(url))
            {
                r2UrlsToValidate.Add((url, i));
            }
            else if (!IsImageKitUrl(url))
            {
                // Invalid URL format
                _logger.LogWarning("Invalid URL format: {Url}", url);
                return FinFail<string[]>(ServiceError.InvalidImageUrl(url));
            }
        }

        // Validate only R2 URLs
        Dictionary<string, string> r2ToImageKitMap = [];
        if (r2UrlsToValidate.Count != 0)
        {
            var tasks = r2UrlsToValidate.Select(item => ConfirmUploadAsync(item.url, ownerId));
            var results = await Task.WhenAll(tasks);
            var failed = results.Where(r => r.IsFail).ToList();

            if (failed.Count > 0)
            {
                failed.ForEach(async item =>
                {
                    await DeleteImageAsync(item.IfFail(err => "")); // #TODO and retry logic or cleanup
                });
                return FinFail<string[]>(ServiceError.BatchValidationFailed("One or more R2 uploads were unsuccessful"));
            }

            // Create mapping from R2 URL to ImageKit URL
            for (int i = 0; i < r2UrlsToValidate.Count; i++)
            {
                var imageKitUrl = results[i].Match(url => url, err => err.Message);
                r2ToImageKitMap[r2UrlsToValidate[i].url] = imageKitUrl;
            }
        }

        // Second pass: build result array preserving original order
        var resultUrls = new string[urls.Length];
        for (int i = 0; i < urls.Length; i++)
        {
            var url = urls[i];
            if (IsR2Url(url))
            {
                resultUrls[i] = r2ToImageKitMap[url];
            }
            else
            {
                // Keep existing ImageKit URL unchanged
                resultUrls[i] = url;
            }
        }

        return FinSucc(resultUrls);
    }

    public Task<Fin<Unit>> DeleteImageAsync(string imageUrl)
    {
        // Convert ImageKit URL back to R2 URL
        var r2Url = ConvertImageKitToR2Url(imageUrl);
        return FinT<IO, string>.Lift(ExtractKeyFromUrl(r2Url))
        .Bind<Unit>(key => liftIO(() => _r2Service.DeleteObjectAsync(key)))
        .Run().Run().AsTask();


    }

    public async Task<Fin<Unit>> DeleteBatchImagesAsync(string[] imageUrls)
    {
        var tasks = imageUrls.Select(DeleteImageAsync);
        var results = await Task.WhenAll(tasks);
        var failed = results.Where(r => r.IsFail).ToList();
        if (failed.Count > 0)
        {
            //TODO add retry logic or cleanup
        }
        return FinSucc(Unit.Default);
    }

    public string ConvertToImageKitUrl(string r2Url)
    {
        Console.WriteLine($"Converting R2 URL to ImageKit URL: {r2Url}");
        if (string.IsNullOrEmpty(r2Url) || string.IsNullOrEmpty(_imageKitOptions.UrlEndpoint) || !Uri.TryCreate(r2Url, UriKind.Absolute, out var r2Uri))
            return r2Url;

        var path = r2Uri.AbsolutePath;

        return $"{_imageKitOptions.UrlEndpoint.TrimEnd('/')}{path}";
    }

    public string GetTransformedImageUrl(string imageUrl, int? width = null, int? height = null)
    {
        if (string.IsNullOrEmpty(imageUrl) || (!width.HasValue && !height.HasValue))
            return imageUrl;

        return string.Format(
             "{0}?tr=w-{1},h-{2}",
             imageUrl,
             width,
             height
         );
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

    private static Fin<string> ExtractKeyFromUrl(string url)
    {
        Uri.TryCreate(url, UriKind.Absolute, out var uri);
        if (uri == null || string.IsNullOrEmpty(uri.AbsolutePath))
            return FinFail<string>(ServiceError.InvalidImageUrl(url));
        var fileUrl = uri.AbsolutePath.TrimStart('/');
        return FinSucc(fileUrl);
    }

    private string ConvertImageKitToR2Url(string imageKitUrl)
    {
        if (string.IsNullOrEmpty(imageKitUrl) || string.IsNullOrEmpty(_imageKitOptions.UrlEndpoint))
            return imageKitUrl;

        if (string.IsNullOrEmpty(_r2Options?.PublicUrl))
            return imageKitUrl;
        if (!Uri.TryCreate(imageKitUrl, UriKind.Absolute, out var imageKitUri))
            return imageKitUrl;

        var path = imageKitUri.AbsolutePath;
        return $"{_r2Options.PublicUrl.TrimEnd('/')}{path}";
    }

    private bool IsR2Url(string url)
    {
        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(_r2Options?.ServiceURL))
            return false;
        if (!Uri.TryCreate(_r2Options.ServiceURL, UriKind.Absolute, out var serviceUri))
            return false;

        return url.Contains(serviceUri.Host, StringComparison.OrdinalIgnoreCase);
    }

    private bool IsImageKitUrl(string url)
    {
        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(_imageKitOptions.UrlEndpoint))
            return false;

        return url.StartsWith(_imageKitOptions.UrlEndpoint.TrimEnd('/'), StringComparison.OrdinalIgnoreCase);
    }
}