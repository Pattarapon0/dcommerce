namespace backend.DTO.User;

public record VerifyEmailRequest
{
    public string Token { get; init; } = string.Empty;
}