namespace NGO.PMS.Contracts.IntegrationEvents.Identity;

/// <summary>
/// Published when a new user is created. Consumed by modules that need to set up
/// user-specific data (e.g., notifications preferences, task assignments).
/// </summary>
public sealed record UserCreatedIntegrationEvent : IntegrationEvent
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
}
