using System.Text.Json;
using Hangfire;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.API.Jobs;

/// <summary>
/// Hangfire recurring job that polls all module outbox tables for unprocessed messages
/// and dispatches them as MediatR notifications to registered consumers.
/// Runs every 10 seconds.
/// </summary>
public sealed class OutboxRelayJob(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxRelayJob> logger)
{
    /// <summary>
    /// Maximum messages to process per DbContext per run.
    /// </summary>
    private const int BatchSize = 50;

    [AutomaticRetry(Attempts = 3)]
    public async Task ProcessOutboxAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        // Get all registered DbContext types that have outbox tables.
        // Currently Identity and PlatformAdmin are active; others added as they're implemented.
        var dbContextTypes = GetActiveDbContextTypes();

        foreach (var dbContextType in dbContextTypes)
        {
            try
            {
                var dbContext = (DbContext)scope.ServiceProvider.GetRequiredService(dbContextType);
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
            .Where(m => m.ProcessedAt == null)
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
                    logger.LogWarning(
                        "Unknown event type '{Type}' for outbox message {Id}",
                        message.EventType, message.Id);
                    message.Error = $"Unknown type: {message.EventType}";
                    message.ProcessedAt = DateTimeOffset.UtcNow;
                    continue;
                }

                var @event = JsonSerializer.Deserialize(message.Payload, eventType);
                if (@event is null)
                {
                    logger.LogWarning(
                        "Failed to deserialize outbox message {Id}", message.Id);
                    message.Error = "Deserialization returned null";
                    message.ProcessedAt = DateTimeOffset.UtcNow;
                    continue;
                }

                // Dispatch via MediatR — all registered INotificationHandlers receive it
                await mediator.Publish(@event);

                message.ProcessedAt = DateTimeOffset.UtcNow;
                message.Error = null;

                logger.LogDebug(
                    "Successfully relayed outbox message {Id} ({Type})",
                    message.Id, eventType.Name);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Failed to process outbox message {Id}", message.Id);
                message.Error = ex.Message;
                message.RetryCount++;
                // Will be retried on next poll
            }
        }

        await dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// Returns the DbContext types that currently have outbox tables configured.
    /// Add new module DbContexts here as they are implemented.
    /// </summary>
    private static Type[] GetActiveDbContextTypes()
    {
        return
        [
            typeof(NGO.PMS.Identity.Infrastructure.Persistence.IdentityDbContext),
            // PlatformAdmin doesn't publish integration events (SuperAdmin-only)
            // Add as modules are implemented:
            // typeof(NGO.PMS.Projects.Infrastructure.Persistence.ProjectsDbContext),
            // typeof(NGO.PMS.Planning.Infrastructure.Persistence.PlanningDbContext),
        ];
    }
}
