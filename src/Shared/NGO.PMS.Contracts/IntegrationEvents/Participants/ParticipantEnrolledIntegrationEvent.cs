using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Participants;

/// <summary>
/// Fired when a participant is enrolled in a project.
/// Consumed by: MEAL (update indicator counts), Dashboards.
/// </summary>
public sealed record ParticipantEnrolledIntegrationEvent : IntegrationEvent
{
    public Guid ParticipantId { get; init; }
    public Guid ProjectId { get; init; }
}
