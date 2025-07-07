namespace backend.DTO.User;

public class RefreshTokenResult
{
    public required string RefreshToken { get; set; } = string.Empty;
    public required DateTime ExpiresAt { get; set; }
}