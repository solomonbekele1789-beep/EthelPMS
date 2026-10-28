using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.Training.Domain.Events;

namespace NGO.PMS.Training.Domain.Entities;

/// <summary>
/// Individual training session within a program per REQ-TRN-003.
/// </summary>
public class TrainingSession : AuditableEntity
{
    public Guid TrainingProgramId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Venue { get; private set; }
    public DateTime ScheduledDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public TrainingStatus Status { get; private set; } = TrainingStatus.Draft;
    public int? MaxParticipants { get; private set; }
    public string? Notes { get; private set; }

    // Navigation
    public ICollection<TrainingParticipant> Participants { get; private set; } = [];

    public static TrainingSession Create(
        Guid trainingProgramId, string title, DateTime scheduledDate,
        string? venue = null, DateTime? endDate = null,
        int? maxParticipants = null, string? notes = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));

        return new TrainingSession
        {
            TrainingProgramId = trainingProgramId,
            Title = title.Trim(),
            ScheduledDate = scheduledDate,
            Venue = venue?.Trim(),
            EndDate = endDate,
            MaxParticipants = maxParticipants,
            Notes = notes?.Trim()
        };
    }

    public void Schedule()
    {
        if (Status != TrainingStatus.Draft)
            throw new InvalidOperationException("Only draft sessions can be scheduled.");
        Status = TrainingStatus.Scheduled;
    }

    public void Start()
    {
        if (Status != TrainingStatus.Scheduled)
            throw new InvalidOperationException("Only scheduled sessions can be started.");
        Status = TrainingStatus.InProgress;
    }

    public void Complete()
    {
        if (Status != TrainingStatus.InProgress)
            throw new InvalidOperationException("Only in-progress sessions can be completed.");
        Status = TrainingStatus.Completed;

        var attendeeCount = Participants.Count(p =>
            p.Status == AttendanceStatus.Attended || p.Status == AttendanceStatus.WalkIn);
        AddDomainEvent(new TrainingSessionCompletedEvent(Id, TrainingProgramId, attendeeCount));
    }

    public void Cancel()
    {
        if (Status == TrainingStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed session.");
        Status = TrainingStatus.Cancelled;
    }
}
