namespace backend.DTO.User;
public record CompleteProfileRequest
{
    public string? Country { get; init; }
    public string? PhoneNumber { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? PreferredLanguage { get; init; }
    public string? PreferredCurrency { get; init; }
}
