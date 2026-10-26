using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Risk;

/// <summary>
/// Fired when a risk score increases after reassessment.
/// Consumed by: Notifications (alert project manager), Reporting (escalation log).
/// </summary>
public sealed record RiskEscalatedIntegrationEvent : IntegrationEvent
{
    public Guid RiskId { get; init; }
    public int PreviousScore { get; init; }
    public int NewScore { get; init; }
}
