using System.Text.Json;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.API.Jobs;

/// <summary>
/// Hangfire recurring job that polls all module outbox tables for unprocessed messages
/// and dispatches them as MediatR notifications to registered consumers.
/// Runs every 10 seconds per docs/plans/shared/CROSS-MODULE-EVENTS.md.
/// </summary>
public sealed class OutboxRelayJob(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxRelayJob> logger)
{
    private const int BatchSize = 50;

    private static readonly Lazy<Type[]> DiscoveredDbContexts = new(() =>
        AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.FullName?.StartsWith("NGO.PMS.", StringComparison.Ordinal) == true)
            .SelectMany(a =>
            {
                try { return a.GetTypes(); }
                catch { return Array.Empty<Type>(); }
            })
            .Where(t => !t.IsAbstract && t.IsClass && typeof(MultiTenantDbContext).IsAssignableFrom(t))
            .Distinct()
            .ToArray());

    [AutomaticRetry(Attempts = 3)]
    public async Task ProcessOutboxAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        foreach (var dbContextType in DiscoveredDbContexts.Value)
        {
            try
            {
                if (scope.ServiceProvider.GetService(dbContextType) is not DbContext dbContext)
                    continue;

                if (dbContext.Model.FindEntityType(typeof(OutboxMessage)) is null)
                    continue;

                await ProcessDbContextOutbox(dbContext, mediator);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process outbox for {DbContext}", dbContextType.Name);
            }
        }
    }

    private async Task ProcessDbContextOutbox(DbContext dbContext, IMediator mediator)
    {
        var messages = await dbContext.Set<OutboxMessage>()
            .Where(m => m.ProcessedAt == null && m.RetryCount < OutboxMessage.MaxRetries)
            .OrderBy(m => m.CreatedAt)
            .Take(BatchSize)
            .ToListAsync();

        if (messages.Count == 0)
            return;

        logger.LogInformation("Processing {Count} outbox messages from {Context}",
            messages.Count, dbContext.GetType().Name);

        foreach (var message in messages)
        {
            try
            {
                var eventType = Type.GetType(message.EventType);
                if (eventType is null)
                {
                    logger.LogWarning("Unknown event type '{Type}' for outbox message {Id}",
                        message.EventType, message.Id);
                    message.Error = $"Unknown type: {message.EventType}";
                    message.RetryCount = OutboxMessage.MaxRetries;
                    continue;
                }

                var @event = JsonSerializer.Deserialize(message.Payload, eventType);
                if (@event is null)
                {
                    logger.LogWarning("Failed to deserialize outbox message {Id}", message.Id);
                    message.Error = "Deserialization returned null";
                    message.RetryCount = OutboxMessage.MaxRetries;
                    continue;
                }

                await mediator.Publish(@event);

                message.ProcessedAt = DateTimeOffset.UtcNow;
                message.Error = null;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to process outbox message {Id} (attempt {Attempt})",
                    message.Id, message.RetryCount + 1);
                message.Error = ex.Message;
                message.RetryCount++;
            }
        }

        await dbContext.SaveChangesAsync();
    }
}
