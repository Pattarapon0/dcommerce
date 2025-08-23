using LanguageExt;
using LanguageExt.Common;
using static LanguageExt.Prelude;

namespace backend.Common.Results;

public class ServiceErrorException : ErrorException
{
    private readonly ServiceError _error;

    public ServiceErrorException(ServiceError error)
        : base(1) // Use a constant code for the base constructor
    {
        _error = error;
    }

    public override ErrorException Combine(ErrorException other) => this;

    public override bool IsExpected => _error.IsExpected;

    public override bool IsExceptional => _error.IsExceptional;

    public override Error ToError() => _error;

    public override int Code => _error.StatusCode;

    public override Option<ErrorException> Inner => None;
}