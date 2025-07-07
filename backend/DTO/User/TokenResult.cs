namespace backend.DTO.User;
public class TokenResult
{
    public required string Token { get; set; }
    public required DateTime ExpiresAt { get; set; }
    public string TokenType { get; set; } = "Bearer";
}
