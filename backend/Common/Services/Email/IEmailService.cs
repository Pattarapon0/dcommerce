using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Common.Services.Email;

public interface IEmailService
{
    Task<Fin<Unit>> SendEmailVerificationAsync(string email, string token, string fullName);
    Task<Fin<Unit>> SendWelcomeEmailAsync(string email, string fullName);
    Task<Fin<Unit>> SendPasswordResetAsync(string email, string token, string fullName);
    Task<Fin<Unit>> SendPasswordChangedNotificationAsync(string email, string fullName);
}