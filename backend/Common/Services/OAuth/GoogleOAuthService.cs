using System.Text;
using System.Text.Json;
using backend.Common.Models;
using backend.Common.Results;
using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Common.Services.OAuth;

public interface IGoogleOAuthService
{
    Task<Fin<GoogleTokenResponse>> ExchangeCodeForTokenPkceAsync(string code, string codeVerifier);
    Task<Fin<GoogleUserInfo>> GetUserInfoAsync(string accessToken);
    Task<Fin<OAuthCallbackData>> ProcessPkceCallbackAsync(string code, string codeVerifier);
}

public class GoogleOAuthService : IGoogleOAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GoogleOAuthService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<Fin<GoogleUserInfo>> GetUserInfoAsync(string accessToken)
    {
        try
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return FinFail<GoogleUserInfo>(ServiceError.Internal($"Failed to get user info from Google: {errorContent}"));
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var userInfo = JsonSerializer.Deserialize<GoogleUserInfo>(responseJson);

            if (userInfo == null || string.IsNullOrEmpty(userInfo.Email))
            {
                return FinFail<GoogleUserInfo>(ServiceError.Internal("Invalid user info response from Google"));
            }

            return FinSucc(userInfo);
        }
        catch (Exception ex)
        {
            return FinFail<GoogleUserInfo>(ServiceError.Internal($"Error getting user info: {ex.Message}"));
        }
        finally
        {
            // Clear authorization header
            _httpClient.DefaultRequestHeaders.Authorization = null;
        }
    }

    public async Task<Fin<GoogleTokenResponse>> ExchangeCodeForTokenPkceAsync(string code, string codeVerifier)
    {
        try
        {
            var clientId = _configuration["Authentication:Google:ClientId"];
            var clientSecret = _configuration["Authentication:Google:ClientSecret"];
            var redirectUri = _configuration["Authentication:Google:RedirectUri"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret) || string.IsNullOrEmpty(redirectUri))
            {
                return FinFail<GoogleTokenResponse>(ServiceError.Internal("Google OAuth credentials not configured"));
            }
            var formParams = new Dictionary<string, string>
                {
                    {"grant_type", "authorization_code"},
                    {"client_id", clientId},
                    {"client_secret", clientSecret},
                    {"code", code},
                    {"code_verifier", codeVerifier},
                    {"redirect_uri", redirectUri}
                };

            var content = new FormUrlEncodedContent(formParams);

            var response = await _httpClient.PostAsync("https://oauth2.googleapis.com/token", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return FinFail<GoogleTokenResponse>(ServiceError.Internal($"Google PKCE token exchange failed: {errorContent}"));
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(responseJson);

            if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            {
                return FinFail<GoogleTokenResponse>(ServiceError.Internal("Invalid token response from Google"));
            }

            return FinSucc(tokenResponse);
        }
        catch (Exception ex)
        {
            return FinFail<GoogleTokenResponse>(ServiceError.Internal($"Error exchanging PKCE code for token: {ex.Message}"));
        }
    }

    public async Task<Fin<OAuthCallbackData>> ProcessPkceCallbackAsync(string code, string codeVerifier)
    {
        var tokenResult = await ExchangeCodeForTokenPkceAsync(code, codeVerifier);
        return await tokenResult.Match(
            Succ: async tokenResponse =>
            {
                var userInfoResult = await GetUserInfoAsync(tokenResponse.AccessToken);
                return userInfoResult.Match(
                    Succ: userInfo => FinSucc(new OAuthCallbackData
                    {
                        Provider = "Google",
                        ProviderKey = userInfo.Id,
                        Email = userInfo.Email,
                        FirstName = userInfo.GivenName,
                        LastName = userInfo.FamilyName,
                        ProfilePictureUrl = userInfo.Picture,
                        EmailVerified = userInfo.VerifiedEmail,
                        AccessToken = tokenResponse.AccessToken,
                        RefreshToken = tokenResponse.RefreshToken,
                        TokenExpiresAt = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn),
                        Scope = tokenResponse.Scope
                    }),
                    Fail: error => FinFail<OAuthCallbackData>(error)
                );
            },
            Fail: error => Task.FromResult(FinFail<OAuthCallbackData>(error))
        );
    }
}