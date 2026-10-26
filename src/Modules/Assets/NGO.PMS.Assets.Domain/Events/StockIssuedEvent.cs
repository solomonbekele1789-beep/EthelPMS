using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Events;

public sealed record StockIssuedEvent(Guid StockItemId, Guid MovementId, decimal Quantity) : IDomainEvent;
