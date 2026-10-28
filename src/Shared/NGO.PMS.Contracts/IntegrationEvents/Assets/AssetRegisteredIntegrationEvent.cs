using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Assets;

/// <summary>
/// Fired when a new asset is registered in the system.
/// Consumed by: FundAccounting (for capitalization entries), Procurement (PO receipt confirmation).
/// </summary>
public sealed record AssetRegisteredIntegrationEvent : IntegrationEvent
{
    public Guid AssetId { get; init; }
    public string AssetCode { get; init; } = string.Empty;
    public Guid? PurchaseOrderId { get; init; }
}
