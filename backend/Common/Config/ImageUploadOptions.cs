namespace backend.Common.Config;

public class ImageUploadOptions
{
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024; // 5MB
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    public string[] AllowedMimeTypes { get; set; } = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    public int MaxUploadsPerMinute { get; set; } = 10;
    public TimeSpan PreSignedUrlExpiry { get; set; } = TimeSpan.FromMinutes(15);
}