namespace NGO.PMS.Contracts.IntegrationEvents.Projects;

/// <summary>
/// Published when a new project is created.
/// Consumed by: Planning, FundAccounting (budget setup), Notifications.
/// </summary>
public sealed record ProjectCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ProjectId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid CreatedByUserId { get; init; }
}
