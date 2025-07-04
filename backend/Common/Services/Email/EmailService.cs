using LanguageExt;
using static LanguageExt.Prelude;
using server.Data.User;
using server.Data.User.Entities;
using LanguageExt.Pretty;

namespace server.Common.Services.Email;

public class EmailService : IEmailService
{
    public Task<Fin<Unit>> SendEmailVerificationAsync(string email, string token, string fullName)
    {
        // Implementation for sending email verification
        Console.WriteLine($"Sending email verification to {email} for {fullName} with token {token}");


        return Task.FromResult(FinSucc(Unit.Default));
    }

    public Task<Fin<Unit>> SendWelcomeEmailAsync(string email, string fullName)
    {
        // Implementation for sending welcome email
        Console.WriteLine($"Sending welcome email to {email} for {fullName}");
        return Task.FromResult(FinSucc(Unit.Default));
    }

    public Task<Fin<Unit>> SendPasswordResetAsync(string email, string token, string fullName)
    {
        // Implementation for sending password reset email
        Console.WriteLine($"Sending password reset email to {email} for {fullName} with token {token}");
        return Task.FromResult(FinSucc(Unit.Default));
    }

    public Task<Fin<Unit>> SendPasswordChangedNotificationAsync(string email, string fullName)
    {
        // Implementation for sending password changed notification
        Console.WriteLine($"Sending password changed notification to {email} for {fullName}");
        return Task.FromResult(FinSucc(Unit.Default));
    }
}