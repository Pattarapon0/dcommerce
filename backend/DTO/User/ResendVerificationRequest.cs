namespace backend.DTO.User;

public record ResendVerificationRequest
{
    public string Email { get; init; } = string.Empty;
}