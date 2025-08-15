namespace backend.Common.Models;

public enum ImageValidationType
{
    Avatar,
    Product,
    SellerProfile,
}

public record ImageValidationConfig
{
    public long MaxSizeBytes { get; set; }
    public ImageDimensions MinDimensions { get; set; } = new();
    public ImageDimensions MaxDimensions { get; set; } = new();
    public string[] AllowedFormats { get; set; } = [];
    public double? MaxAspectRatio { get; set; }
    public double? MinAspectRatio { get; set; }
    public bool RequireSquare { get; set; }
}

public class ImageDimensions
{
    public int Width { get; set; }
    public int Height { get; set; }
}

public class ImageValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public ImageMetadata? Metadata { get; set; }
}

public class ImageMetadata
{
    public string RealType { get; set; } = string.Empty;
    public string Extension { get; set; } = string.Empty;
    public int Width { get; set; }
    public int Height { get; set; }
    public double AspectRatio { get; set; }
    public long FileSize { get; set; }
    public string FileSizeFormatted { get; set; } = string.Empty;
}

public static class ImageValidationPresets
{
    public static readonly Dictionary<ImageValidationType, ImageValidationConfig> Presets = new()
    {
        [ImageValidationType.Avatar] = new ImageValidationConfig
        {
            MaxSizeBytes = 5242880, // 5MB - matches appsettings
            MinDimensions = new ImageDimensions { Width = 50, Height = 50 },
            MaxDimensions = new ImageDimensions { Width = 2048, Height = 2048 },
            AllowedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
            MaxAspectRatio = 3.0,
            MinAspectRatio = 0.33
        },

        [ImageValidationType.Product] = new ImageValidationConfig
        {
            MaxSizeBytes = 8388608, // 8MB - matches appsettings  
            MinDimensions = new ImageDimensions { Width = 100, Height = 100 },
            MaxDimensions = new ImageDimensions { Width = 2048, Height = 2048 },
            AllowedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
            MaxAspectRatio = 5.0,
            MinAspectRatio = 0.2
        },

        [ImageValidationType.SellerProfile] = new ImageValidationConfig
        {
            MaxSizeBytes = 5242880, // 5MB - matches appsettings
            MinDimensions = new ImageDimensions { Width = 50, Height = 50 },
            MaxDimensions = new ImageDimensions { Width = 2048, Height = 2048 },
            AllowedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
            MaxAspectRatio = 3.0, // Matches backend SellerProfileMaxAspectRatio
            MinAspectRatio = 0.33 // Matches backend SellerProfileMinAspectRatio
        },
    };

    public static ImageValidationConfig GetConfig(ImageValidationType type)
    {
        return Presets[type];
    }
}