using LanguageExt;
using backend.Common.Models;
using backend.Common.Services.Password;
using backend.Common.Services.Token;
using backend.Data.User;
using backend.Data.User.Entities;
using static LanguageExt.Prelude;
using backend.Common.Results;
using backend.Common.Mappers;

namespace backend.Common.Services.Auth;

public class AuthService(IUserRepository userRepository, IPasswordService passwordService, ITokenService tokenService) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordService _passwordService = passwordService;
    private readonly ITokenService _tokenService = tokenService;

    public async Task<Fin<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        var emailExistsResult = await _userRepository.EmailExistsAsync(request.Email);
        return await emailExistsResult.Match(
            Succ: async emailExists =>
            {
                if (emailExists)
                {
                    return FinFail<RegisterResponse>(ServiceErrorExtensions.EmailAlreadyExistsWithField());
                }
                var passwordHashResult = _passwordService.HashPassword(request.Password);
                return await passwordHashResult.Match(
                    Succ: async hashedPassword =>
                    {
                        // UPDATED: Use new method that creates both User and UserProfile
                        var (newUser, newProfile) = UserMapper.CreateUserWithProfile(request, hashedPassword);

                        // Create user first
                        var userCreationResult = await _userRepository.CreateAsync(newUser);
                        return await userCreationResult.Match(
                            Succ: createdUser => Task.FromResult(FinSucc(AuthResponseMapper.CreateRegisterResponse(createdUser))),
                            Fail: error => Task.FromResult(FinFail<RegisterResponse>(error))
                        );
                    },
                    Fail: error => Task.FromResult(FinFail<RegisterResponse>(error))
                );
            },
            Fail: error => Task.FromResult(FinFail<RegisterResponse>(error))
        );
    }

    public async Task<Fin<VerifyEmailResponse>> VerifyEmailAsync(VerifyEmailRequest request)
    {
        var userResult = await _userRepository.GetByVerificationTokenAsync(request.Token);

        return await userResult.Match(
            Succ: async user =>
            {
                if (user.IsVerified)
                {
                    return FinFail<VerifyEmailResponse>(ServiceError.Validation("Email is already verified"));
                }

                var verifyResult = await _userRepository.VerifyEmailAsync(user.Id);
                return verifyResult.Match(
                    Succ: _ => FinSucc(AuthResponseMapper.CreateVerifyEmailResponse(user)),
                    Fail: error => FinFail<VerifyEmailResponse>(error)
                );
            },
            Fail: error => Task.FromResult(FinFail<VerifyEmailResponse>(error))
        );
    }

    public async Task<Fin<LoginResponse>> LoginAsync(LoginRequest request)
    {
        var emailResult = await _userRepository.GetByEmailAsync(request.Email);
        return await emailResult.Match(
            Succ: async user =>
            {
                var passwordResult = _passwordService.VerifyPassword(request.Password, user.PasswordHash ?? string.Empty);
                return await passwordResult.Match(
                    Succ: async isValid =>
                    {
                        if (!isValid)
                        {
                            // Update failed login attempts
                            _ = Task.Run(async () => 
                            {
                                var currentAttempts = user.FailedLoginAttempts + 1;
                                await _userRepository.UpdateFailedLoginAttemptsAsync(user.Id, currentAttempts, DateTime.UtcNow);
                            });
                            
                            return FinFail<LoginResponse>(ServiceErrorExtensions.InvalidCredentialsWithFields());
                        }
                        
                        var accessTokenResult = _tokenService.GenerateAccessToken(user);
                        return await accessTokenResult.Match(
                            Succ: async accessToken =>
                            {
                                var refreshTokenResult = _tokenService.GenerateRefreshToken();
                                return await refreshTokenResult.Match(
                                    Succ: async refreshToken =>
                                    {
                                        // Complete successful login (add refresh token + update last login) in one transaction
                                        var loginCompleteResult = await _userRepository.CompleteSuccessfulLoginAsync(user.Id, new RefreshToken
                                        {
                                            Token = refreshToken.RefreshToken,
                                            ExpiresAt = refreshToken.ExpiresAt,
                                            UserId = user.Id,
                                            IsRevoked = false
                                        });
                                        
                                        return loginCompleteResult.Match(
                                            Succ: _ => FinSucc(new LoginResponse
                                            {
                                                AccessToken = accessToken.Token,
                                                Token = accessToken,
                                                RefreshToken = refreshToken
                                            }),
                                            Fail: error => FinFail<LoginResponse>(error)
                                        );
                                    },
                                    Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                                );
                            },
                            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                        );
                    },
                    Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                );
            },
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }

    public async Task<Fin<LoginResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        // Get the refresh token from database
        var refreshTokenResult = await _userRepository.GetRefreshTokenAsync(request.RefreshToken);
        
        return await refreshTokenResult.Match(
            Succ: async refreshToken =>
            {
                // Check if refresh token is expired or revoked
                if (refreshToken.IsRevoked || refreshToken.ExpiresAt <= DateTime.UtcNow)
                {
                    return FinFail<LoginResponse>(ServiceError.Unauthorized("Refresh token is invalid or expired"));
                }

                // Get the user
                var userResult = await _userRepository.GetByIdAsync(refreshToken.UserId);
                return await userResult.Match(
                    Succ: async user =>
                    {
                        // Generate new access token
                        var newAccessTokenResult = _tokenService.GenerateAccessToken(user);
                        return await newAccessTokenResult.Match(
                            Succ: async newAccessToken =>
                            {
                                // Generate new refresh token
                                var newRefreshTokenResult = _tokenService.GenerateRefreshToken();
                                return await newRefreshTokenResult.Match(
                                    Succ: async newRefreshToken =>
                                    {
                                        // Revoke old refresh token
                                        await _userRepository.RevokeRefreshTokenAsync(request.RefreshToken);
                                        
                                        // Store new refresh token
                                        var storeResult = await _userRepository.AddRefreshTokenAsync(new RefreshToken
                                        {
                                            Token = newRefreshToken.RefreshToken,
                                            ExpiresAt = newRefreshToken.ExpiresAt,
                                            UserId = user.Id,
                                            IsRevoked = false
                                        });

                                        return storeResult.Match(
                                            Succ: _ => FinSucc(new LoginResponse
                                            {
                                                AccessToken = newAccessToken.Token,
                                                Token = newAccessToken,
                                                RefreshToken = newRefreshToken
                                            }),
                                            Fail: error => FinFail<LoginResponse>(error)
                                        );
                                    },
                                    Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                                );
                            },
                            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                        );
                    },
                    Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
                );
            },
            Fail: error => Task.FromResult(FinFail<LoginResponse>(error))
        );
    }
}
