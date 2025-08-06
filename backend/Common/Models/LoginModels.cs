namespace backend.Common.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public TokenResult? Token { get; set; } = null;

    public RefreshTokenResult? RefreshToken { get; set; } = null;
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}