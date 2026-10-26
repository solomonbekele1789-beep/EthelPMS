using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Risk;

/// <summary>
/// Fired when a new risk is identified on a project.
/// Consumed by: Reporting (risk summary), Projects (project risk status).
/// </summary>
public sealed record RiskIdentifiedIntegrationEvent : IntegrationEvent
{
    public Guid RiskId { get; init; }
    public Guid ProjectId { get; init; }
    public int RiskScore { get; init; }
}
