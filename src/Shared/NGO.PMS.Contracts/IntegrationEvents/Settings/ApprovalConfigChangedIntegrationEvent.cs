using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Settings;

/// <summary>
/// Published when an approval configuration is changed.
/// Consumed by: Tasks, Projects, Procurement, and other approval-dependent modules.
/// </summary>
public sealed record ApprovalConfigChangedIntegrationEvent : IntegrationEvent
{
    public Guid ApprovalConfigId { get; init; }
    public string Module { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
}
