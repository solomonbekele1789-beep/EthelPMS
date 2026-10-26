using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Training;

/// <summary>
/// Fired when a training session is completed.
/// Consumed by: Participants (graduation pillar computation), Reporting (training metrics).
/// </summary>
public sealed record TrainingSessionCompletedIntegrationEvent : IntegrationEvent
{
    public Guid SessionId { get; init; }
    public Guid ProgramId { get; init; }
    public int AttendeeCount { get; init; }
}
