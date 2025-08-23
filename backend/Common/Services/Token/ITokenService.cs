using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using LanguageExt;
using backend.Common.Models;
using backend.Data.User.Entities;
using static LanguageExt.Prelude;

namespace backend.Common.Services.Token;

public interface ITokenService
{
    // Returns Fin for token generation that can fail
    Fin<TokenResult> GenerateAccessToken(User user);

    // Returns tuple of token and expiry, as both are always required together
    Fin<RefreshTokenResult> GenerateRefreshToken();

    // Returns Fin as principal validation can fail
    Fin<ClaimsPrincipal> ValidateAccessToken(string token);

    // Returns Fin for validation that can fail
    Fin<bool> ValidateRefreshToken(RefreshTokenResult refreshToken);

    // Returns raw JWT token for inspection (no validation)
    JwtSecurityToken DecodeToken(string token);

    // Returns Fin as token validation can fail
    Fin<Guid> GetUserIdFromToken(string token);
}
