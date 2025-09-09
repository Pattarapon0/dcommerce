using System.Text.Json.Serialization;

namespace backend.Common.Models;

/// <summary>
/// Request model for PKCE OAuth token exchange
/// </summary>
public class GooglePkceTokenRequest
{
    [JsonPropertyName("grant_type")]
    public string GrantType { get; set; } = "authorization_code";

    [JsonPropertyName("client_id")]
    public required string ClientId { get; set; }

    [JsonPropertyName("client_secret")]
    public required string ClientSecret { get; set; }

    [JsonPropertyName("code")]
    public required string Code { get; set; }

    [JsonPropertyName("code_verifier")]
    public required string CodeVerifier { get; set; }

    [JsonPropertyName("redirect_uri")]
    public string? RedirectUri { get; set; }
}

/// <summary>
/// Response model from Google token exchange
/// </summary>
public class GoogleTokenResponse
{
    [JsonPropertyName("access_token")]
    public required string AccessToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = "Bearer";

    [JsonPropertyName("id_token")]
    public string? IdToken { get; set; }
}

/// <summary>
/// Google user profile information from Google API
/// </summary>
public class GoogleUserInfo
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("email")]
    public required string Email { get; set; }

    [JsonPropertyName("verified_email")]
    public bool VerifiedEmail { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("given_name")]
    public string? GivenName { get; set; }

    [JsonPropertyName("family_name")]
    public string? FamilyName { get; set; }

    [JsonPropertyName("picture")]
    public string? Picture { get; set; }

    [JsonPropertyName("locale")]
    public string? Locale { get; set; }
}

/// <summary>
/// Internal model for OAuth callback processing
/// </summary>
public class OAuthCallbackData
{
    public required string Provider { get; set; }
    public required string ProviderKey { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool EmailVerified { get; set; }
    public required string AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime TokenExpiresAt { get; set; }
    public string? Scope { get; set; }
}

/// <summary>
/// Request model for PKCE OAuth callback
/// </summary>
public class PkceCallbackRequest
{
    public required string Code { get; set; }
    public required string CodeVerifier { get; set; }
    public string? State { get; set; }
}