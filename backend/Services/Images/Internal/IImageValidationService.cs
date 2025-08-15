using LanguageExt;
using backend.Common.Models;

namespace backend.Services.Images.Internal;

public interface IImageValidationService
{
    bool IsValidExtension(string fileName);
    string GetMimeType(string fileName);
    bool IsValidFileSize(long sizeBytes);
    bool IsValidFileSize(long sizeBytes, ImageValidationType validationType);
    Task<Fin<bool>> VerifyImageContentAsync(string url);
    bool HasValidImageSignature(byte[] fileBytes);
    Task<Fin<ImageValidationResult>> ValidateImageAsync(Stream imageStream, string objectType);
}