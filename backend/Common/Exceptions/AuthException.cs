namespace backend.Common.Exceptions;

public class AuthException : Exception
{
    public AuthException() : base() { }

    public AuthException(string message) : base(message) { }

    public AuthException(string message, Exception innerException)
        : base(message, innerException) { }
}

public class InvalidCredentialsException : AuthException
{
    public InvalidCredentialsException()
        : base("Invalid email or password") { }
}

public class AccountLockedException(int minutesUntilUnlock) : AuthException($"Account is locked. Try again in {minutesUntilUnlock} minutes")
{
}

public class EmailNotVerifiedException : AuthException
{
    public EmailNotVerifiedException()
        : base("Email address is not verified") { }
}

public class InvalidTokenException : AuthException
{
    public InvalidTokenException()
        : base("The provided token is invalid or expired") { }
}
