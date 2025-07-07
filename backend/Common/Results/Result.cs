namespace backend.Common.Results;

public class Result<T>
{
    public bool Success { get; }
    public T? Data { get; }
    public string? Error { get; }
    public List<string> Errors { get; protected set; }

    protected Result(bool success, T? data, string? error)
    {
        Success = success;
        Data = data;
        Error = error;
        Errors = [];

        if (error != null)
        {
            Errors.Add(error);
        }
    }

    public static Result<T> Ok(T data) => new(true, data, null);

    public static Result<T> Fail(string error) => new(false, default, error);

    public static Result<T> Fail(List<string> errors) =>
        new(false, default, errors.FirstOrDefault()) { Errors = errors };

    public bool IsSuccess => Success;
    public bool IsFailure => !Success;
}

public class Result : Result<object>
{
    protected Result(bool success, object? data, string? error) 
        : base(success, data, error)
    {
    }

    public static Result Ok() => new(true, null, null);

    public static new Result Fail(string error) => new(false, null, error);

    public static new Result Fail(List<string> errors) =>
        new(false, null, errors.FirstOrDefault()) { Errors = errors };
}
