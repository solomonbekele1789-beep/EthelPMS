using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Participants;

/// <summary>
/// Fired when a participant graduation is approved. Irreversible.
/// Consumed by: MEAL, Reporting, Dashboards.
/// </summary>
public sealed record ParticipantGraduatedIntegrationEvent : IntegrationEvent
{
    public Guid ParticipantId { get; init; }
    public Guid ProjectId { get; init; }
    public Guid DecisionId { get; init; }
}
