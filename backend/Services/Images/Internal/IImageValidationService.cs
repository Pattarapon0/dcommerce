using LanguageExt;

namespace backend.Services.Images.Internal;

public interface IImageValidationService
{
    bool IsValidExtension(string fileName);
    string GetMimeType(string fileName);
    bool IsValidFileSize(long sizeBytes);
    Task<Fin<bool>> VerifyImageContentAsync(string url);
    bool HasValidImageSignature(byte[] fileBytes);
}