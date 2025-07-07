namespace backend.DTO.User;
public record UserProfileSummary
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
    public bool ProfileComplete { get; init; }
    public bool IsOAuthUser { get; init; }
    public string Role { get; init; } = "User";
    public DateTime CreatedAt { get; init; }
}
