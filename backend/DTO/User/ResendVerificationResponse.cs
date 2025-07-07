namespace backend.DTO.User;

public record ResendVerificationResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
}
