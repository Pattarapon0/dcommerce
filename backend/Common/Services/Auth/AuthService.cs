using LanguageExt;
using backend.Common.Models;
using backend.Common.Services.Password;
using backend.Common.Services.Token;
using backend.Data.User;
using backend.Data.User.Entities;
using static LanguageExt.Prelude;
using backend.Common.Results;
using backend.Common.Mappers;
using backend.Common.Services.OAuth;

namespace backend.Common.Services.Auth;

public class AuthService(IUserRepository userRepository, IPasswordService passwordService, ITokenService tokenService, IGoogleOAuthService googleOAuthService) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordService _passwordService = passwordService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IGoogleOAuthService _googleOAuthService = googleOAuthService;

    public async Task<Fin<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        var emailExistsResult = await _userRepository.EmailExistsAsync(request.Email);
        return emailExistsResult.Bind<bool>(x => x ? ServiceErrorExtensions.EmailAlreadyExistsWithField() : true).Bind(_ => _passwordService.HashPassword(request.Password)).Bind<RegisterResponse>(hashedPassword =>
        {
            var (newUser, newProfile) = UserMapper.CreateUserWithProfile(request, hashedPassword);
            return liftIO(_userRepository.CreateAsync(newUser)).Map(createdUser => AuthResponseMapper.CreateRegisterResponse(createdUser)).Run().Run();
        });

    }

    public async Task<Fin<VerifyEmailResponse>> VerifyEmailAsync(VerifyEmailRequest request)
    {
        var userResult = await _userRepository.GetByVerificationTokenAsync(request.Token);
        return userResult.Bind<User>(user => user.IsVerified ? ServiceError.Validation("Email is already verified") : user)
        .Bind(user =>
        {
            return liftIO(_userRepository.VerifyEmailAsync(user.Id)).Run().Run().Map(AuthResponseMapper.CreateVerifyEmailResponse(user));
        });
    }

    public Task<Fin<LoginResponse>> LoginAsync(LoginRequest request)
    {
        return FinT<IO, User>.Lift(liftIO(() => _userRepository.GetByEmailAsync(request.Email)))
        .Bind<LoginResponse>(user =>
        _passwordService.VerifyPassword(request.Password, user.PasswordHash ?? string.Empty)
            .Bind<User>(isValid =>
                isValid
                    ? user
                    : liftIO<Fin<Unit>>((_) =>
                {
                    // Update failed login attempts
                    var currentAttempts = user.FailedLoginAttempts + 1;
                    return _userRepository.UpdateFailedLoginAttemptsAsync(user.Id, currentAttempts, DateTime.UtcNow);

                }).Run<Fin<Unit>>().Bind<User>(_ => ServiceErrorExtensions.InvalidCredentialsWithFields())
        ).Bind<TokenResult>(user => _tokenService.GenerateAccessToken(user)).Bind<LoginResponse>(accessToken => _tokenService.GenerateRefreshToken()
        .Bind<LoginResponse>(refreshToken => liftIO<Fin<Unit>>(() =>
        {
            // Complete successful login (add refresh token + update last login) in one transaction
            return _userRepository.CompleteSuccessfulLoginAsync(user.Id, new RefreshToken
            {
                Token = refreshToken.RefreshToken,
                ExpiresAt = refreshToken.ExpiresAt,
                UserId = user.Id,
                IsRevoked = false
            });
        }).Map(_ => new LoginResponse
        {
            AccessToken = accessToken.Token,
            Token = accessToken,
            RefreshToken = refreshToken
        }).Run()))).Run().Run().AsTask();
    }

    public Task<Fin<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        // Get the refresh token from database
        var user = FinT<IO, RefreshToken>.Lift(liftIO<Fin<RefreshToken>>(() => _userRepository.GetRefreshTokenAsync(request.RefreshToken)))
        .Bind<User>((rt => rt.IsRevoked || rt.ExpiresAt <= DateTime.UtcNow ? ServiceError.Unauthorized("Refresh token is invalid or expired") : liftIO<Fin<User>>(() => _userRepository.GetByIdAsync(rt.UserId))));
        var Token = user.Bind<TokenResult>(user => _tokenService.GenerateAccessToken(user));
        var refreshToken = Token.Bind<RefreshTokenResult>(accessToken => _tokenService.GenerateRefreshToken())
            .Bind<RefreshTokenResult>(refreshToken => liftIO<Fin<Unit>>(() => _userRepository.RevokeRefreshTokenAsync(request.RefreshToken)).Run<Fin<Unit>>().Map(_ => refreshToken));

        return refreshToken.Bind(refreshToken => user.Bind<RefreshToken>(user => liftIO(() => _userRepository.AddRefreshTokenAsync(new RefreshToken
        {
            Token = refreshToken.RefreshToken,
            ExpiresAt = refreshToken.ExpiresAt,
            UserId = user.Id,
            IsRevoked = false
        })).Run<Fin<RefreshToken>>()).Bind<LoginResponse>(_ => Token.Map<LoginResponse>(Token => new LoginResponse
        {
            AccessToken = Token.Token,
            Token = Token,
            RefreshToken = refreshToken
        }))).Run().Run().AsTask();
    }

    public async Task<Fin<LoginResponse>> HandlePkceCallbackAsync(PkceCallbackRequest request, string? ipAddress = null, string? userAgent = null)
    {
        // Process PKCE callback to get user info
        var oauthDataResult = await _googleOAuthService.ProcessPkceCallbackAsync(request.Code, request.CodeVerifier);
        return await oauthDataResult.Match(
            Succ: async oauthData => await ProcessOAuthUserAsync(oauthData, ipAddress, userAgent),
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }

    private async Task<Fin<LoginResponse>> ProcessOAuthUserAsync(OAuthCallbackData oauthData, string? ipAddress, string? userAgent)
    {
        // Try to find existing user by OAuth provider
        var existingUserResult = await _userRepository.GetUserByProviderAsync(oauthData.Provider, oauthData.ProviderKey);

        return await existingUserResult.Match(
            Succ: async existingUser => await LoginExistingOAuthUserAsync(existingUser, oauthData),
            Fail: async _ => await CreateAndLoginNewOAuthUserAsync(oauthData)
        );
    }

    private async Task<Fin<LoginResponse>> LoginExistingOAuthUserAsync(Data.User.Entities.User user, OAuthCallbackData oauthData)
    {
        // Update OAuth tokens for existing user
        var userLoginResult = await _userRepository.GetUserLoginAsync(oauthData.Provider, oauthData.ProviderKey);
        return await userLoginResult.Match(
            Succ: async userLogin =>
            {
                // Update tokens
                userLogin.AccessToken = oauthData.AccessToken;
                userLogin.RefreshTokenOAuth = oauthData.RefreshToken;
                userLogin.TokenExpiresAt = oauthData.TokenExpiresAt;
                userLogin.LastUsedAt = DateTime.UtcNow;
                userLogin.Scope = oauthData.Scope;

                await _userRepository.UpdateUserLoginAsync(userLogin);

                // Generate JWT tokens for our app
                return await GenerateLoginTokensAsync(user);
            },
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }

    private async Task<Fin<LoginResponse>> CreateAndLoginNewOAuthUserAsync(OAuthCallbackData oauthData)
    {
        // Check if user exists with same email (for linking)
        var emailUserResult = await _userRepository.GetByEmailAsync(oauthData.Email);

        return await emailUserResult.Match(
            Succ: async existingUser => await LinkOAuthToExistingUserAsync(existingUser, oauthData),
            Fail: async _ => await CreateNewOAuthUserAsync(oauthData)
        );
    }

    private async Task<Fin<LoginResponse>> LinkOAuthToExistingUserAsync(Data.User.Entities.User existingUser, OAuthCallbackData oauthData)
    {
        // Link OAuth account to existing user
        var userLogin = new UserLogin
        {
            UserId = existingUser.Id,
            Provider = oauthData.Provider,
            ProviderKey = oauthData.ProviderKey,
            ProviderDisplayName = oauthData.Provider,
            AccessToken = oauthData.AccessToken,
            RefreshTokenOAuth = oauthData.RefreshToken,
            TokenExpiresAt = oauthData.TokenExpiresAt,
            LastUsedAt = DateTime.UtcNow,
            Scope = oauthData.Scope,
            TokenType = "Bearer",
            User = existingUser
        };

        var createLoginResult = await _userRepository.CreateUserLoginAsync(userLogin);
        return await createLoginResult.Match(
            Succ: async _ => await GenerateLoginTokensAsync(existingUser),
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }

    private async Task<Fin<LoginResponse>> CreateNewOAuthUserAsync(OAuthCallbackData oauthData)
    {
        // Create new user from OAuth data
        var newUser = new Data.User.Entities.User
        {
            Id = Guid.NewGuid(),
            Email = oauthData.Email,
            IsVerified = oauthData.EmailVerified, // Trust OAuth provider's email verification
            Role = "Buyer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            LastLogin = DateTime.UtcNow,
            PasswordHash = null // OAuth users don't have passwords
        };

        // Create user profile from OAuth data
        var userProfile = new UserProfile
        {
            UserId = newUser.Id,
            FirstName = oauthData.FirstName ?? "",
            LastName = oauthData.LastName ?? "",
            AvatarUrl = null, // Temporarily disable Google profile images to avoid CORS validation issues
            Country = "Unknown", // Required field, will be updated later
            User = newUser
        };

        // Set the profile on user
        newUser.Profile = userProfile;

        // Create user
        var userCreationResult = await _userRepository.CreateAsync(newUser);
        return await userCreationResult.Match(
            Succ: async createdUser =>
            {
                // Create OAuth login record
                var userLogin = new UserLogin
                {
                    UserId = createdUser.Id,
                    Provider = oauthData.Provider,
                    ProviderKey = oauthData.ProviderKey,
                    ProviderDisplayName = oauthData.Provider,
                    AccessToken = oauthData.AccessToken,
                    RefreshTokenOAuth = oauthData.RefreshToken,
                    TokenExpiresAt = oauthData.TokenExpiresAt,
                    LastUsedAt = DateTime.UtcNow,
                    Scope = oauthData.Scope,
                    TokenType = "Bearer",
                    User = createdUser
                };

                var createLoginResult = await _userRepository.CreateUserLoginAsync(userLogin);
                return await createLoginResult.Match(
                    Succ: async _ => await GenerateLoginTokensAsync(createdUser),
                    Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                );
            },
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }

    private Task<Fin<LoginResponse>> GenerateLoginTokensAsync(Data.User.Entities.User user)
    {
        var accessTokenResult = _tokenService.GenerateAccessToken(user);
        var refreshTokenResult = _tokenService.GenerateRefreshToken();
        return refreshTokenResult.Bind(refreshToken => liftIO(() => _userRepository.CompleteSuccessfulLoginAsync(user.Id, new RefreshToken
        {
            Token = refreshToken.RefreshToken,
            ExpiresAt = refreshToken.ExpiresAt,
            UserId = user.Id,
            IsRevoked = false
        })).Run().Bind(_ => accessTokenResult.Map(accessToken => new LoginResponse
        {
            AccessToken = accessToken.Token,
            Token = accessToken,
            RefreshToken = refreshToken

        }))).AsTask();
    }
}
