namespace server.Common.Config;

public class AuthSettings
{
    public required JwtConfig Jwt { get; set; }
    public required SecurityConfig Security { get; set; }
}

public class JwtConfig
{
    public required string Key { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public int TokenExpiryMinutes { get; set; } = 15;
    public int RefreshTokenExpiryDays { get; set; } = 7;
}

public class SecurityConfig
{
    public int MaxLoginAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
    public bool RequireEmailVerification { get; set; } = true;
    public int MinPasswordLength { get; set; } = 8;
    public bool RequireUppercase { get; set; } = true;
    public bool RequireDigit { get; set; } = true;
    public bool RequireSpecialCharacter { get; set; } = true;
}
