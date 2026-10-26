using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Assets;

/// <summary>
/// Fired when an asset disposal is completed.
/// Consumed by: FundAccounting (for write-off journal entries).
/// </summary>
public sealed record AssetDisposedIntegrationEvent : IntegrationEvent
{
    public Guid AssetId { get; init; }
    public Guid DisposalId { get; init; }
    public decimal DisposalValue { get; init; }
}
