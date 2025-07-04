using LanguageExt;
using server.Common.Config;
using server.Common.Results;
using static LanguageExt.Prelude;

namespace server.Common.Services.Password;

public class PasswordService : IPasswordService
{
    private readonly PasswordRequirements _requirements;

    public PasswordService(PasswordRequirements requirements)
    {
        _requirements = requirements;
    }

    public Fin<string> HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            return FinFail<string>(ServiceError.RequiredField("Password"));

        try
        {
            return FinSucc(BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12));
        }
        catch (Exception)
        {
            return FinFail<string>(ServiceError.PasswordHashFailed());
        }
    }

    public Fin<bool> VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
            return FinSucc<bool>(false);

        try
        {
            return FinSucc(BCrypt.Net.BCrypt.Verify(password, hash));
        }
        catch
        {
            return FinFail<bool>(ServiceError.PasswordHashFailed());
        }
    }

    public Fin<Unit> ValidatePasswordRequirements(string password)
    {
        if (string.IsNullOrEmpty(password))
            return FinFail<Unit>(ServiceError.RequiredField("Password"));

        var errors = new List<string>();

        if (password.Length < _requirements.MinPasswordLength)
            errors.Add($"Password must be at least {_requirements.MinPasswordLength} characters long");

        if (_requirements.RequireUppercase && !password.Any(char.IsUpper))
            errors.Add("Password must contain at least one uppercase letter");

        if (_requirements.RequireDigit && !password.Any(char.IsDigit))
            errors.Add("Password must contain at least one digit");

        if (_requirements.RequireSpecialCharacter && !password.Any(ch => !char.IsLetterOrDigit(ch)))
            errors.Add("Password must contain at least one special character");

        return errors.Count == 0
            ? FinSucc(Unit.Default)
            : FinFail<Unit>(ServiceError.WeakPassword());
    }
}
