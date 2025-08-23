using LanguageExt;
using backend.DTO.Products;

namespace backend.Services.Images;

public interface IImageService
{
    Task<Fin<string>> GenerateUploadUrlAsync(string fileName, Guid ownerId, string objectType = "product");
    Task<Fin<BatchUploadUrlResponse>> GenerateBatchUploadUrlsAsync(List<string> fileNames, Guid ownerId, string objectType = "product");
    Task<Fin<string>> ConfirmUploadAsync(string r2Url, Guid sellerId);
    Task<Fin<string[]>> ConfirmBatchUploadAsync(string[] r2Urls, Guid ownerId);
    Task<Fin<Unit>> DeleteImageAsync(string imageUrl);
    string ConvertToImageKitUrl(string r2Url);
    string GetTransformedImageUrl(string imageUrl, int? width = null, int? height = null);
    //Task<Fin<Unit>> CleanupAbandonedUploadsAsync();
}