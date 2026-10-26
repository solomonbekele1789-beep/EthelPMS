namespace NGO.PMS.API.Middleware;

/// <summary>
/// Ensures every request has a correlation ID for distributed tracing.
/// If X-Correlation-Id header is present, uses it; otherwise generates a new one.
/// </summary>
public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.ContainsKey(CorrelationIdHeader))
        {
            context.Request.Headers[CorrelationIdHeader] = Guid.NewGuid().ToString();
        }

        var correlationId = context.Request.Headers[CorrelationIdHeader].ToString();

        // Add to response headers for client tracing
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[CorrelationIdHeader] = correlationId;
            return Task.CompletedTask;
        });

        // Store in HttpContext.Items for downstream services
        context.Items["CorrelationId"] = correlationId;

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
