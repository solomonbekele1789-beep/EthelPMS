namespace NGO.PMS.Contracts.IntegrationEvents.Procurement;

public sealed record PurchaseOrderApprovedIntegrationEvent(
    Guid PurchaseOrderId,
    Guid ProjectId,
    decimal TotalAmount,
    string Currency) : IntegrationEvent;
