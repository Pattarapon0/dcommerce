using LanguageExt;
using server.Common.Models;
using server.Common.Services.Password;
using server.Data.User;
using server.Data.User.Entities;
using static LanguageExt.Prelude;
using server.Common.Results;
using server.Common.Mappers;

namespace server.Common.Services.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;

    public AuthService(IUserRepository userRepository, IPasswordService passwordService)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
    }

    public async Task<Fin<RegisterResponse>> RegisterAsync(RegisterRequest request)
    {
        var emailExistsResult = await _userRepository.EmailExistsAsync(request.Email);
        
        return await emailExistsResult.Match(
            Succ: async emailExists => 
            {
                if (emailExists)
                {
                    return FinFail<RegisterResponse>(ServiceError.EmailAlreadyExists());
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
}
