using MediatR;
using Microsoft.EntityFrameworkCore.Diagnostics;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.SharedKernel.Persistence;

/// <summary>
/// Dispatches domain events via MediatR after SaveChanges succeeds.
/// Events are collected from all BaseEntity instances in the change tracker.
/// </summary>
public class DomainEventDispatchInterceptor : SaveChangesInterceptor
{
    private readonly IMediator _mediator;

    public DomainEventDispatchInterceptor(IMediator mediator)
        => _mediator = mediator;

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        var dbContext = eventData.Context;
        if (dbContext is null) return result;

        var entities = dbContext.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.Entity.DomainEvents.Count > 0)
            .Select(e => e.Entity)
            .ToList();

        var domainEvents = entities
            .SelectMany(e => e.DomainEvents)
            .ToList();

        entities.ForEach(e => e.ClearDomainEvents());

        foreach (var domainEvent in domainEvents)
        {
            await _mediator.Publish(domainEvent, cancellationToken);
        }

        return result;
    }
}
