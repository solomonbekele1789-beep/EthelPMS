using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Partnerships;

/// <summary>
/// Published when a new sub-grantee partner is registered.
/// Consumed by: FundAccounting, Projects, Notifications.
/// </summary>
public sealed record SubGranteeRegisteredIntegrationEvent : IntegrationEvent
{
    public Guid SubGranteeId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string PartnerType { get; init; } = string.Empty;
}
