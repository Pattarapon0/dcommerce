namespace backend.Common.Config;

public class ImageUploadOptions
{
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024; // 5MB
    public long ProductMaxFileSizeBytes { get; set; } = 8 * 1024 * 1024; // 8MB
    public string[] AllowedExtensions { get; set; } = [];
    public string[] AllowedMimeTypes { get; set; } = [];
    public int MaxUploadsPerMinute { get; set; } = 10;
    public TimeSpan PreSignedUrlExpiry { get; set; } = TimeSpan.FromMinutes(15);

    // Batch upload settings
    public int MaxFilesPerBatch { get; set; } = 10;
    public int ProductBatchRequestsPerMinute { get; set; } = 5;

    // Avatar validation settings
    public int AvatarMinWidth { get; set; } = 50;
    public int AvatarMinHeight { get; set; } = 50;
    public int AvatarMaxWidth { get; set; } = 2048;
    public int AvatarMaxHeight { get; set; } = 2048;
    public double AvatarMinAspectRatio { get; set; } = 0.33;
    public double AvatarMaxAspectRatio { get; set; } = 3.0;

    // Product validation settings  
    public int ProductMinWidth { get; set; } = 100;
    public int ProductMinHeight { get; set; } = 100;
    public int ProductMaxWidth { get; set; } = 2048;
    public int ProductMaxHeight { get; set; } = 2048;
    public double ProductMinAspectRatio { get; set; } = 0.2;
    public double ProductMaxAspectRatio { get; set; } = 5.0;

    // SellerProfile validation settings
    public int SellerProfileMinWidth { get; set; } = 50;
    public int SellerProfileMinHeight { get; set; } = 50;
    public int SellerProfileMaxWidth { get; set; } = 1024;
    public int SellerProfileMaxHeight { get; set; } = 1024;
    public double SellerProfileMinAspectRatio { get; set; } = 1.0;
    public double SellerProfileMaxAspectRatio { get; set; } = 1.0;
}