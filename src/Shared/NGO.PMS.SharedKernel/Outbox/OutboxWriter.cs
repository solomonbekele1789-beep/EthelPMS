using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace NGO.PMS.SharedKernel.Outbox;

/// <summary>
/// Generic outbox writer that works with any DbContext containing an OutboxMessages DbSet.
/// </summary>
public class OutboxWriter : IOutboxWriter
{
    private readonly DbContext _dbContext;

    public OutboxWriter(DbContext dbContext)
        => _dbContext = dbContext;

    public async Task WriteAsync<TEvent>(TEvent integrationEvent, CancellationToken ct = default)
        where TEvent : class
    {
        var runtimeType = integrationEvent.GetType();
        var integration = integrationEvent as IIntegrationEvent;

        var message = new OutboxMessage
        {
            Id = integration?.EventId ?? Guid.NewGuid(),
            OrganizationId = integration?.OrganizationId ?? Guid.Empty,
            EventType = runtimeType.AssemblyQualifiedName ?? runtimeType.FullName ?? runtimeType.Name,
            Payload = JsonSerializer.Serialize(integrationEvent, runtimeType),
            CreatedAt = integration?.OccurredOn ?? DateTimeOffset.UtcNow
        };

        await _dbContext.Set<OutboxMessage>().AddAsync(message, ct);
    }
}

/// <summary>
/// Typed outbox writer for clean per-module DI registration.
/// </summary>
public sealed class OutboxWriter<TDbContext>(TDbContext dbContext) : OutboxWriter(dbContext)
    where TDbContext : DbContext;
