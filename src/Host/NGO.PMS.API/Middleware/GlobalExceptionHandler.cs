using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using NGO.PMS.SharedKernel.Api;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.API.Middleware;

/// <summary>
/// Global exception handler that maps domain exceptions to appropriate HTTP responses.
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
                    message = validationEx.Message,
                    detail = validationEx.Message,
                    errors = validationEx.Errors
                }),

            NotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                (object)new { success = false, message = notFoundEx.Message, detail = notFoundEx.Message }),

            ForbiddenException forbiddenEx => (
                HttpStatusCode.Forbidden,
                (object)new { success = false, message = forbiddenEx.Message, detail = forbiddenEx.Message }),

            BusinessRuleException businessEx => (
                (HttpStatusCode)422,
                (object)new { success = false, message = businessEx.Message, detail = businessEx.Message }),

            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                (object)new { success = false, message = "Authentication required.", detail = "Authentication required." }),

            _ => (
                HttpStatusCode.InternalServerError,
                (object)new { success = false, message = "An unexpected error occurred.", detail = "An unexpected error occurred." })
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
