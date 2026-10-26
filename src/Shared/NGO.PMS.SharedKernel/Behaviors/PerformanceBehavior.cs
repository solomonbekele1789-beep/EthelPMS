using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace NGO.PMS.SharedKernel.Behaviors;

/// <summary>
/// Pipeline behavior that warns when a request exceeds the 500ms performance target.
/// </summary>
public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private const int WarningThresholdMs = 500;

    public PerformanceBehavior(ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
        => _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();

        var response = await next();

        stopwatch.Stop();
        var elapsedMs = stopwatch.ElapsedMilliseconds;

        if (elapsedMs > WarningThresholdMs)
        {
            _logger.LogWarning(
                "Long running request: {RequestName} ({ElapsedMs}ms) — exceeds {Threshold}ms threshold",
                typeof(TRequest).Name, elapsedMs, WarningThresholdMs);
        }

        return response;
    }
}
