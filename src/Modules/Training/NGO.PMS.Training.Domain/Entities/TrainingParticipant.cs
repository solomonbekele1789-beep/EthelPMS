using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.Training.Domain.Events;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Training session participant with attendance tracking per REQ-TRN-004.
/// Supports both registered participants and walk-ins.
/// </summary>
public class TrainingParticipant : AuditableEntity
{
    public Guid TrainingSessionId { get; private set; }
    public Guid? ParticipantId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public AttendanceStatus Status { get; private set; } = AttendanceStatus.Registered;
    public DateTime? AttendedAt { get; private set; }
    public decimal? PreTestScore { get; private set; }
    public decimal? PostTestScore { get; private set; }
    public string? CertificateNumber { get; private set; }

    public static TrainingParticipant Create(
        Guid trainingSessionId, string fullName,
        Guid? participantId = null)
    {
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Full name is required.", nameof(fullName));

        var status = participantId.HasValue
            ? AttendanceStatus.Registered
            : AttendanceStatus.WalkIn;

        return new TrainingParticipant
        {
            TrainingSessionId = trainingSessionId,
            ParticipantId = participantId,
            FullName = fullName.Trim(),
            Status = status
        };
    }

    public void MarkAttended()
    {
        Status = AttendanceStatus.Attended;
        AttendedAt = DateTime.UtcNow;

        if (ParticipantId.HasValue)
        {
            AddDomainEvent(new TrainingAttendanceRecordedEvent(
                ParticipantId.Value, TrainingSessionId, AttendanceStatus.Attended));
        }
    }

    public void MarkAbsent()
    {
        Status = AttendanceStatus.Absent;
        AttendedAt = null;
    }

    public void RecordScores(decimal? preTestScore, decimal? postTestScore)
    {
        PreTestScore = preTestScore;
        PostTestScore = postTestScore;
    }
}
