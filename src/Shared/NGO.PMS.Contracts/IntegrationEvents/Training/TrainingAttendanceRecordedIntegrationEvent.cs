using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.Training;

/// <summary>
/// Fired when participant attendance is recorded at a training session.
/// Consumed by: Participants (feeds graduation pillar P1 training attendance).
/// </summary>
public sealed record TrainingAttendanceRecordedIntegrationEvent : IntegrationEvent
{
    public Guid ParticipantId { get; init; }
    public Guid SessionId { get; init; }
    public string AttendanceStatus { get; init; } = string.Empty;
}
