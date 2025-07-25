using LanguageExt;

namespace backend.Services.Images;

public interface IImageService
{
    Task<Fin<string>> GenerateUploadUrlAsync(string fileName, Guid sellerId);
    Task<Fin<string>> ConfirmUploadAsync(string r2Url, Guid sellerId);
    Task<Fin<Unit>> DeleteImageAsync(string imageUrl);
    string ConvertToImageKitUrl(string r2Url);
    string GetTransformedImageUrl(string imageUrl, int? width = null, int? height = null);
    //Task<Fin<Unit>> CleanupAbandonedUploadsAsync();
}