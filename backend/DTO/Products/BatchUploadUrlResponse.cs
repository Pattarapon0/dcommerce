namespace backend.DTO.Products;

public class BatchUploadUrlResponse
{
    public List<UploadUrlResult> Results { get; set; } = [];
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(15);
    public long MaxFileSize { get; set; } 
    public string [] AllowedTypes { get; set; } = [];
}

public class UploadUrlResult
{
    public string FileName { get; set; } = string.Empty;
    public string? UploadUrl { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}