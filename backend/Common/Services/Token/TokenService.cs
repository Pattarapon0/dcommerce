using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using LanguageExt;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using backend.Common.Config;
using backend.Common.Models;
using backend.Common.Results;
using backend.Data.User.Entities;
using static LanguageExt.Prelude;

namespace backend.Common.Services.Token;

public class TokenService : ITokenService
{
    private readonly AuthSettings _authSettings;
    private readonly JwtSecurityTokenHandler _tokenHandler;
    private readonly TokenValidationParameters _validationParameters;

    public TokenService(IOptions<AuthSettings> authSettings)
    {
        _authSettings = authSettings.Value;
        _tokenHandler = new JwtSecurityTokenHandler();

        var key = Encoding.UTF8.GetBytes(_authSettings.Jwt.Key);
        _validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _authSettings.Jwt.Issuer,
            ValidAudience = _authSettings.Jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    }

    public Fin<TokenResult> GenerateAccessToken(User user)
    {
        try
        {
            var key = Encoding.UTF8.GetBytes(_authSettings.Jwt.Key);
            var securityKey = new SymmetricSecurityKey(key);
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new(ClaimTypes.Role, user.Role),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expiresAt = DateTime.UtcNow.AddMinutes(_authSettings.Jwt.TokenExpiryMinutes);
            var token = new JwtSecurityToken(
                issuer: _authSettings.Jwt.Issuer,
                audience: _authSettings.Jwt.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
            );

            return FinSucc(new TokenResult
            {
                Token = _tokenHandler.WriteToken(token),
                ExpiresAt = expiresAt
            });
        }
        catch (Exception)
        {
            return FinFail<TokenResult>(ServiceError.TokenGenerationFailed());
        }
    }

    public Fin<RefreshTokenResult> GenerateRefreshToken()
    {
        try
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            
            var expiresAt = DateTime.UtcNow.AddDays(_authSettings.Jwt.RefreshTokenExpiryDays);
            return FinSucc(new RefreshTokenResult
            {
                RefreshToken = Convert.ToBase64String(randomBytes),
                ExpiresAt = expiresAt
            });
        }
        catch (Exception)
        {
            return FinFail<RefreshTokenResult>(ServiceError.TokenGenerationFailed());
        }
    }

    public Fin<ClaimsPrincipal> ValidateAccessToken(string token)
    {
        try
        {
            var principal = _tokenHandler.ValidateToken(token, _validationParameters, out _);
            return FinSucc(principal);
        }
        catch (SecurityTokenExpiredException)
        {
            return FinFail<ClaimsPrincipal>(ServiceError.TokenExpired());
        }
        catch (SecurityTokenInvalidSignatureException)
        {
            return FinFail<ClaimsPrincipal>(ServiceError.InvalidTokenSignature());
        }
        catch (SecurityTokenMalformedException)
        {
            return FinFail<ClaimsPrincipal>(ServiceError.InvalidTokenFormat());
        }
        catch (Exception)
        {
            return FinFail<ClaimsPrincipal>(ServiceError.InvalidToken("Invalid access token"));
        }
    }

    public Fin<bool> ValidateRefreshToken(RefreshTokenResult refreshToken)
    {
        try
        {
            // Validate token format (should be base64)
            Convert.FromBase64String(refreshToken.RefreshToken);

            // Check expiration
            return refreshToken.ExpiresAt > DateTime.UtcNow
                ? FinSucc(true)
                : FinSucc(false);
        }
        catch (FormatException)
        {
            return FinFail<bool>(ServiceError.InvalidTokenFormat());
        }
        catch (Exception)
        {
            return FinFail<bool>(ServiceError.InvalidToken("Invalid refresh token"));
        }
    }

    public JwtSecurityToken DecodeToken(string token)
    {
        return _tokenHandler.ReadJwtToken(token);
    }

    public Fin<Guid> GetUserIdFromToken(string token)
    {
        try
        {
            if (!_tokenHandler.CanReadToken(token))
            {
                return FinFail<Guid>(ServiceError.InvalidTokenFormat());
            }
            
            var jwt = _tokenHandler.ReadJwtToken(token);
            var subClaim = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            
            if (subClaim == null)
            {
                return FinFail<Guid>(ServiceError.MissingTokenClaims());
            }

            if (!Guid.TryParse(subClaim, out var userId))
            {
                return FinFail<Guid>(ServiceError.InvalidTokenFormat());
            }

            return FinSucc(userId);
        }
        catch (Exception)
        {
            return FinFail<Guid>(ServiceError.InvalidTokenFormat());
        }
    }
}
