namespace backend.DTO.User;

public class UpdateUserPreferencesRequest
{
    public string? Timezone { get; set; }
    public string? Language { get; set; }
}