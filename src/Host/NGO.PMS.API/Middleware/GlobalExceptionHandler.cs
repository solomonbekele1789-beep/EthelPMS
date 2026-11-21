using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using NGO.PMS.SharedKernel.Api;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Global exception handler that maps domain exceptions to standardized HTTP responses.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, response) = exception switch
        {
            ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                (object)new
                {
                    success = false,
                    code = "VALIDATION_ERROR",
                    message = validationEx.Message,
                    detail = validationEx.Message,
                    errors = validationEx.Errors,
                    errorDetails = validationEx.Errors
                        .SelectMany(kv => kv.Value.Select(msg => new ApiError("VALIDATION_ERROR", msg, kv.Key)))
                        .ToList()
                }),

            NotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                (object)new
                {
                    success = false,
                    code = "NOT_FOUND",
                    message = notFoundEx.Message,
                    detail = notFoundEx.Message,
                    errorDetails = new[] { new ApiError("NOT_FOUND", notFoundEx.Message) }
                }),

            ConflictException conflictEx => (
                HttpStatusCode.Conflict,
                (object)new
                {
                    success = false,
                    code = conflictEx.Code,
                    message = conflictEx.Message,
                    detail = conflictEx.Message,
                    errorDetails = new[] { new ApiError(conflictEx.Code, conflictEx.Message) }
                }),

            AccountLockedException lockedEx => (
                HttpStatusCode.Locked,
                (object)new
                {
                    success = false,
                    code = "ACCOUNT_LOCKED",
                    message = lockedEx.Message,
                    detail = lockedEx.Message,
                    lockedUntil = lockedEx.LockedUntil,
                    errorDetails = new[] { new ApiError("ACCOUNT_LOCKED", lockedEx.Message) }
                }),

            ForbiddenException forbiddenEx => (
                HttpStatusCode.Forbidden,
                (object)new
                {
                    success = false,
                    code = "FORBIDDEN",
                    message = forbiddenEx.Message,
                    detail = forbiddenEx.Message,
                    errorDetails = new[] { new ApiError("FORBIDDEN", forbiddenEx.Message) }
                }),

            BusinessRuleException businessEx => (
                (HttpStatusCode)422,
                (object)new
                {
                    success = false,
                    code = "BUSINESS_RULE_VIOLATION",
                    message = businessEx.Message,
                    detail = businessEx.Message,
                    errorDetails = new[] { new ApiError("BUSINESS_RULE_VIOLATION", businessEx.Message) }
                }),

            UnauthorizedAccessException unauthEx => (
                HttpStatusCode.Unauthorized,
                (object)new
                {
                    success = false,
                    code = "INVALID_CREDENTIALS",
                    message = string.IsNullOrWhiteSpace(unauthEx.Message) ? "Authentication required." : unauthEx.Message,
                    detail = string.IsNullOrWhiteSpace(unauthEx.Message) ? "Authentication required." : unauthEx.Message,
                    errorDetails = new[] { new ApiError("INVALID_CREDENTIALS", string.IsNullOrWhiteSpace(unauthEx.Message) ? "Authentication required." : unauthEx.Message) }
                }),

            _ => (
                HttpStatusCode.InternalServerError,
                (object)new
                {
                    success = false,
                    code = "INTERNAL_ERROR",
                    message = "An unexpected error occurred.",
                    detail = "An unexpected error occurred.",
                    errorDetails = new[] { new ApiError("INTERNAL_ERROR", "An unexpected error occurred.") }
                })
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({StatusCode}): {Message}",
                (int)statusCode, exception.Message);
        }

        httpContext.Response.StatusCode = (int)statusCode;
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
        return true;
    }
}
