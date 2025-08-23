using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Common;

public record GenerateAvatarUploadUrlRequest
{
    [Required]
    [MaxLength(255)]
    public string FileName { get; init; } = string.Empty;

    [Range(1, 10485760)] // 1 byte to 10MB
    public long? FileSize { get; init; }

    [RegularExpression(@"^image/(jpeg|jpg|png|webp|gif)$", ErrorMessage = "Only JPEG, PNG, WebP, and GIF images are allowed")]
    public string? ContentType { get; init; }
}

public record ConfirmAvatarUploadRequest
{
    [Required]
    [Url]
    public string R2Url { get; init; } = string.Empty;

    [MaxLength(255)]
    public string? OriginalFileName { get; init; }
}

public record UploadUrlResponse
{
    public string Url { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public long MaxFileSize { get; init; }
    public string[] AllowedTypes { get; init; } = [];
}

public record AvatarUploadResponse
{
    public string AvatarUrl { get; init; } = string.Empty;
    public DateTime UploadedAt { get; init; }
}