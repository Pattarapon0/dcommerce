namespace backend.DTO.User;
public record RegisterResponse
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string? Country { get; init; }
    public bool ProfileComplete { get; init; }
    public bool IsOAuthUser { get; init; }
    public string Message { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}