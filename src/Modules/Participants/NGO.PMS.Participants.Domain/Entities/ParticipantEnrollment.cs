using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Many-to-many participant–project enrollment per REQ-PART-005.
/// Tracks enrollment lifecycle including exit and graduation.
/// </summary>
public class ParticipantEnrollment : AuditableEntity
{
    public Guid ParticipantId { get; private set; }
    public Guid ProjectId { get; private set; }
    public EnrollmentStatus Status { get; private set; } = EnrollmentStatus.Enrolled;
    public DateTimeOffset EnrollmentDate { get; private set; }
    public DateTimeOffset? ExitDate { get; private set; }
    public string? ExitReason { get; private set; }
    public string? CohortName { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Participant? Participant { get; private set; }

    public static ParticipantEnrollment Create(
        Guid participantId, Guid projectId, Guid orgId,
        string? cohortName = null)
    {
        var enrollment = new ParticipantEnrollment
        {
            ParticipantId = participantId,
            ProjectId = projectId,
            EnrollmentDate = DateTimeOffset.UtcNow,
            CohortName = cohortName,
            OrganizationId = orgId
        };
        enrollment.AddDomainEvent(new ParticipantEnrolledEvent(
            participantId, projectId, enrollment.Id));
        return enrollment;
    }

    public void Exit(string reason)
    {
        if (Status != EnrollmentStatus.Enrolled)
            throw new InvalidOperationException("Only enrolled participants can exit.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Exit reason is required.", nameof(reason));

        Status = EnrollmentStatus.Exited;
        ExitDate = DateTimeOffset.UtcNow;
        ExitReason = reason;
    }

    public void Complete()
    {
        if (Status != EnrollmentStatus.Enrolled)
            throw new InvalidOperationException("Only enrolled participants can be marked complete.");
        Status = EnrollmentStatus.Completed;
        ExitDate = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Mark enrollment as graduated. Called after graduation decision approval.
    /// </summary>
    internal void MarkGraduated()
    {
        Status = EnrollmentStatus.Graduated;
        ExitDate = DateTimeOffset.UtcNow;
    }
}
