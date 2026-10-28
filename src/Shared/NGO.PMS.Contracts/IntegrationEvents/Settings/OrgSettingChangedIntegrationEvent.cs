using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Settings;

/// <summary>
/// Published when an organization setting is changed.
/// Consumed by: All modules that depend on org-level configuration.
/// </summary>
public sealed record OrgSettingChangedIntegrationEvent : IntegrationEvent
{
    public Guid OrgSettingId { get; init; }
    public string SettingKey { get; init; } = string.Empty;
    public string NewValue { get; init; } = string.Empty;
}
