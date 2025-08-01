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
        return emailResult.Match(
            Succ: user =>
            {
                var passwordResult = _passwordService.VerifyPassword(request.Password, user.PasswordHash ?? string.Empty);
                return passwordResult.Match(
                    Succ: isValid =>
                    {
                        if (!isValid)
                        {
                            return FinFail<LoginResponse>(ServiceErrorExtensions.InvalidCredentialsWithFields());
                        }
                        return _tokenService.GenerateAccessToken(user).Match(
                            Succ: t =>
                            {
                                return _tokenService.GenerateRefreshToken().Match(
                                    Succ: refreshToken => FinSucc(new LoginResponse
                                    {
                                        AccessToken = t.Token,
                                        Token = t,
                                        RefreshToken = refreshToken
                                    }),
                                    Fail: error => FinFail<LoginResponse>(error)
                                );
                            },
                            Fail: error => FinFail<LoginResponse>(error)
                        );
                    },
                    Fail: error => FinFail<LoginResponse>(error)
                );
            },
            Fail: error => FinFail<LoginResponse>(error)
        );
    }
}
