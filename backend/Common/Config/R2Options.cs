namespace backend.Common.Config;

public class R2Options
{
    public string BucketName { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Region { get; set; } = "auto";
    public string ServiceURL { get; set; } = string.Empty;
    public string PublicUrl { get; set; } = string.Empty;
}