using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Partnerships;

/// <summary>
/// Published when a disbursement to a sub-grantee is created.
/// Consumed by: FundAccounting, Notifications.
/// </summary>
public sealed record DisbursementCreatedIntegrationEvent : IntegrationEvent
{
    public Guid DisbursementId { get; init; }
    public Guid SubGranteeId { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
}
