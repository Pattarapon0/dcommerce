namespace backend.DTO.User;
public record VerifyEmailResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public TokenResult? AccessToken { get; init; }
    public string? RefreshToken { get; init; }
    public UserProfileSummary? Profile { get; init; }
}