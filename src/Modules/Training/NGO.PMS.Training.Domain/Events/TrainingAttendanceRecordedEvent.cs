using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Domain.Events;

/// <summary>
/// Raised when attendance is recorded. Feeds into graduation pillar computation.
/// </summary>
public sealed record TrainingAttendanceRecordedEvent(
    Guid ParticipantId,
    Guid SessionId,
    AttendanceStatus Status) : IDomainEvent;
