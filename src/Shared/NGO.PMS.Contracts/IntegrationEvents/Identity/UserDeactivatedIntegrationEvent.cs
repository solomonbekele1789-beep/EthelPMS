namespace NGO.PMS.Contracts.IntegrationEvents.Identity;

/// <summary>
/// Published when a user is deactivated. Consuming modules should
/// revoke active sessions, reassign tasks, and clean up user references.
/// </summary>
public sealed record UserDeactivatedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
    public string Reason { get; init; } = string.Empty;
}
