using LanguageExt;
using LanguageExt.Common;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using FluentValidation.Results;
using backend.Common.Results;
using static LanguageExt.Prelude;

namespace backend.Controllers.Common;

[ApiController]
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Validates a request and executes business logic if validation passes
    /// </summary>
    protected async Task<ObjectResult> ValidateAndExecuteAsync<TRequest>(
        TRequest request,
        Func<Task<Fin<object>>> businessLogic)
        where TRequest : class
    {
        var validationResult = await ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return HandleValidationErrors(validationResult);
        }

        var result = await businessLogic();
        return HandleResult(result);
    }

    /// <summary>
    /// Validates a request and executes business logic if validation passes (with typed response)
    /// </summary>
    protected async Task<ObjectResult> ValidateAndExecuteAsync<TRequest, TResponse>(
        TRequest request, 
        Func<Task<Fin<TResponse>>> businessLogic) 
        where TRequest : class
    {
        var validationResult = await ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return HandleValidationErrors(validationResult);
        }

        var result = await businessLogic();
        return HandleResult(result);
    }

    /// <summary>
    /// Validates a model using FluentValidation
    /// </summary>
    private async Task<ValidationResult> ValidateAsync<T>(T model) where T : class
    {
        // Get validator from DI container
        var validator = HttpContext.RequestServices.GetService<IValidator<T>>();
        
        if (validator == null)
        {
            // If no validator found, consider it valid (optional validation)
            return new ValidationResult();
        }

        return await validator.ValidateAsync(model);
    }

    /// <summary>
    /// Converts FluentValidation errors to ServiceError format with structured field errors
    /// </summary>
    private ObjectResult  HandleValidationErrors(ValidationResult validationResult)
    {
        // NEW: Use structured validation errors instead of concatenated string
        var serviceError = ServiceError.FromFluentValidation(validationResult);
        return StatusCode(serviceError.StatusCode, serviceError);
    }
    /// <summary>
    /// Handles Fin<T> results and converts them to appropriate HTTP responses
    /// </summary>
    protected ObjectResult  HandleResult<T>(Fin<T> result)
    {
        return result.Match(
            Succ: data => HandleSuccess(data),
            Fail: error => HandleError(error)
        );
    }

    /// <summary>
    /// Handles successful results with ServiceSuccess wrapper
    /// </summary>
    private ObjectResult  HandleSuccess<T>(T data)
    {
        // Determine the appropriate success type based on HTTP method
        var httpMethod = Request.Method.ToUpperInvariant();
        
        var serviceSuccess = httpMethod switch
        {
            "POST" => ServiceSuccess<T>.Created(data),
            "PUT" or "PATCH" => ServiceSuccess<T>.Updated(data),
            "DELETE" => ServiceSuccess<T>.Deleted(),
            _ => ServiceSuccess<T>.Retrieved(data)
        };

        return StatusCode(serviceSuccess.StatusCode, serviceSuccess);
    }

    /// <summary>
    /// Handles error results with proper HTTP status codes
    /// </summary>
    private ObjectResult  HandleError(Error error)
    {
        if (error is ServiceError serviceError)
        {
            return StatusCode(serviceError.StatusCode, serviceError);
        }

        // Fallback for non-ServiceError errors
        var fallbackError = ServiceError.Internal($"An unexpected error occurred: {error.Message}");
        return StatusCode(fallbackError.StatusCode, fallbackError);
    }

    /// <summary>
    /// Helper for handling async Fin<T> results
    /// </summary>
    protected async Task<IActionResult> HandleResultAsync<T>(Task<Fin<T>> resultTask)
    {
        var result = await resultTask;
        return HandleResult(result);
    }

    /// <summary>
    /// Helper for handling results where success should return NoContent (204)
    /// </summary>
    protected ObjectResult  HandleNoContentResult<T>(Fin<T> result)
    {
        return result.Match(
            Succ: _ => 
            {
                var serviceSuccess = ServiceSuccess<object>.NoContent();
                return StatusCode(serviceSuccess.StatusCode, serviceSuccess);
            },
            Fail: error => HandleError(error)
        );
    }

    /// <summary>
    /// Helper for handling results where success should return Created (201) with location
    /// </summary>
    protected ObjectResult  HandleCreatedResult<T>(Fin<T> result, string actionName, object routeValues)
    {
        return result.Match(
            Succ: data => 
            {
                var serviceSuccess = ServiceSuccess<T>.Created(data);
                return CreatedAtAction(actionName, routeValues, serviceSuccess);
            },
            Fail: error => HandleError(error)
        );
    }

    /// <summary>
    /// Helper for endpoints that might return no data (Unit type)
    /// </summary>
    protected ObjectResult  HandleUnitResult(Fin<Unit> result)
    {
        return result.Match(
            Succ: _ => 
            {
                var serviceSuccess = ServiceSuccess<object>.NoContent();
                return StatusCode(serviceSuccess.StatusCode, serviceSuccess);
            },
            Fail: error => HandleError(error)
        );
    }

    /// <summary>
    /// Gets the current user ID from the JWT token claims
    /// </summary>
    protected Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("id");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }
}