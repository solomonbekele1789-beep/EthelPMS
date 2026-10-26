namespace NGO.PMS.Contracts.IntegrationEvents.Identity;

/// <summary>
/// Published when organization settings change.
/// All modules should refresh cached org data.
/// </summary>
public sealed record OrganizationUpdatedIntegrationEvent : IntegrationEvent
{
    public string Name { get; init; } = string.Empty;
    public string? LogoUrl { get; init; }
    public string Timezone { get; init; } = string.Empty;
    public string CalendarPreference { get; init; } = string.Empty;
}
