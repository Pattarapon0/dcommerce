using LanguageExt;
using static LanguageExt.Prelude;

namespace backend.Common.Services.Password;

public interface IPasswordService
{
    // Returns hashed password or validation error
    Fin<string> HashPassword(string password);

    // Returns success/failure for password verification
    Fin<bool> VerifyPassword(string password, string hash);

    // Returns success or validation errors
    Fin<Unit> ValidatePasswordRequirements(string password);
}
