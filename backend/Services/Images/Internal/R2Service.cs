using Amazon.S3;
using Amazon.S3.Model;
using backend.Common.Config;
using backend.Common.Results;
using LanguageExt;
using Microsoft.Extensions.Options;
using static LanguageExt.Prelude;

namespace backend.Services.Images.Internal;

public class R2Service(IAmazonS3 s3Client, IOptions<R2Options> options, ILogger<R2Service> logger) : IR2Service
{
    private readonly IAmazonS3 _s3Client = s3Client;
    private readonly R2Options _options = options.Value;
    private readonly ILogger<R2Service> _logger = logger;

    public async Task<Fin<string>> GeneratePreSignedUploadUrlAsync(string key, string contentType, long maxSizeBytes, TimeSpan expiration)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.Add(expiration),
                ContentType = contentType
            };

            // Add conditions to restrict upload
            request.Headers["x-amz-content-sha256"] = "UNSIGNED-PAYLOAD";

            var preSignedUrl = await _s3Client.GetPreSignedURLAsync(request);

            _logger.LogInformation("Generated pre-signed URL for key: {Key}", key);
            return FinSucc(preSignedUrl);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed to generate pre-signed URL for key: {Key}", key);
            return FinFail<string>(ServiceError.StorageServiceUnavailable());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error generating pre-signed URL for key: {Key}", key);
            return FinFail<string>(ServiceError.Internal($"Failed to generate upload URL: {ex.Message}"));
        }
    }

    public async Task<Fin<bool>> ObjectExistsAsync(string key)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            await _s3Client.GetObjectMetadataAsync(request);
            return FinSucc(true);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return FinSucc(false);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed to check if object exists: {Key}", key);
            return FinFail<bool>(ServiceError.StorageServiceUnavailable());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error checking object existence: {Key}", key);
            return FinFail<bool>(ServiceError.Internal($"Failed to check object existence: {ex.Message}"));
        }
    }

    public async Task<Fin<ObjectMetadata>> GetObjectMetadataAsync(string key)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            var response = await _s3Client.GetObjectMetadataAsync(request);

            var metadata = new ObjectMetadata(
                Size: response.ContentLength,
                ContentType: response.Headers.ContentType ?? "unknown",
                LastModified: response.LastModified ?? DateTime.UtcNow
            );

            return FinSucc(metadata);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return FinFail<ObjectMetadata>(ServiceError.ImageNotFound(key));
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed to get object metadata: {Key}", key);
            return FinFail<ObjectMetadata>(ServiceError.StorageServiceUnavailable());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error getting object metadata: {Key}", key);
            return FinFail<ObjectMetadata>(ServiceError.Internal($"Failed to get object metadata: {ex.Message}"));
        }
    }

    public async Task<Fin<Unit>> DeleteObjectAsync(string key)
    {
        try
        {
            key = key.Contains('/') ? key.Split(['/'], 2)[1] : key;
            var request = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key
            };

            await _s3Client.DeleteObjectAsync(request);

            _logger.LogInformation("Deleted object: {Key}", key);
            return FinSucc(Unit.Default);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed to delete object: {Key}", key);
            return FinFail<Unit>(ServiceError.StorageServiceUnavailable());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting object: {Key}", key);
            return FinFail<Unit>(ServiceError.Internal($"Failed to delete object: {ex.Message}"));
        }
    }

    public string GetPublicUrl(string key)
    {
        return $"{_options.PublicUrl.TrimEnd('/')}/{key}";
    }
}