namespace NGO.PMS.Contracts.IntegrationEvents.Identity;

/// <summary>
/// Published when a user's role assignments change (assigned or removed).
/// </summary>
public sealed record RoleChangedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
    public List<string> RoleNames { get; init; } = [];
    public string ChangeType { get; init; } = string.Empty; // "assigned" or "removed"
}
