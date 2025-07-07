namespace backend.Common.Models;

public class TokenResult
{
    public required string Token { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
}

public class RefreshTokenResult
{
    public required string RefreshToken { get; set; } = string.Empty;
    public required DateTime ExpiresAt { get; set; }
}