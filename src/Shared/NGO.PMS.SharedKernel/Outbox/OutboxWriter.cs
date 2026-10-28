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
        var message = new OutboxMessage
        {
            EventType = typeof(TEvent).AssemblyQualifiedName ?? typeof(TEvent).FullName ?? typeof(TEvent).Name,
            Payload = JsonSerializer.Serialize(integrationEvent),
            CreatedAt = DateTimeOffset.UtcNow
        };

        await _dbContext.Set<OutboxMessage>().AddAsync(message, ct);
    }
}
