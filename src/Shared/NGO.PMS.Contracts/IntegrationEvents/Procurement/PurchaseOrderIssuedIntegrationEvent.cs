using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Procurement;

public sealed record PurchaseOrderIssuedIntegrationEvent : IntegrationEvent
{
    public Guid PurchaseOrderId { get; init; }
    public Guid SupplierId { get; init; }
    public decimal TotalAmount { get; init; }
}
