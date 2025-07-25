using LanguageExt;

namespace backend.Services.Images.Internal;

public record ObjectMetadata(long Size, string ContentType, DateTime LastModified);

public interface IR2Service
{
    Task<Fin<string>> GeneratePreSignedUploadUrlAsync(string key, string contentType, long maxSizeBytes, TimeSpan expiration);
    Task<Fin<bool>> ObjectExistsAsync(string key);
    Task<Fin<ObjectMetadata>> GetObjectMetadataAsync(string key);
    Task<Fin<Unit>> DeleteObjectAsync(string key);
    string GetPublicUrl(string key);
}