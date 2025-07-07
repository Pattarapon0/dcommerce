using static LanguageExt.Prelude;

namespace backend.Common.Results;

public record ServiceSuccess<T>
{
    private ServiceSuccess(T? data, string message = "", int statusCode = 200)
    {
        Data = data;
        Message = message;
        StatusCode = statusCode;
    }

    public T? Data { get; }
    public string Message { get; }
    public int StatusCode { get; }

    // Factory methods for common success cases
    public static ServiceSuccess<T> Created(T data) =>
        new(data, "Resource created successfully", 201);

    public static ServiceSuccess<T> Updated(T data) =>
        new(data, "Resource updated successfully", 200);

    public static ServiceSuccess<T> Retrieved(T data) =>
        new(data, "Resource retrieved successfully", 200);

    public static ServiceSuccess<T> Deleted() =>
        new(default, "Resource deleted successfully", 200);

    public static ServiceSuccess<T> NoContent() =>
        new(default, "Operation completed successfully", 204);
}

