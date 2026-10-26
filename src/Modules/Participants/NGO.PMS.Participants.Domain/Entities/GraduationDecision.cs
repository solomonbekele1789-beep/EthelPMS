using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Domain.Entities;

/// <summary>
/// Graduation decision per REQ-GRAD-003/004/005.
/// Ready-to-graduate: P4 OR requiredMetPct >= 85%.
/// Once approved, graduation is irreversible.
/// </summary>
public class GraduationDecision : AuditableEntity
{
    public Guid ParticipantId { get; private set; }
    public Guid ProjectId { get; private set; }
    public GraduationDecisionStatus Status { get; private set; } = GraduationDecisionStatus.Pending;

    /// <summary>
    /// Percentage of required benchmarks where participant has reached P4 (0-100).
    /// </summary>
    public decimal RequiredMetPercentage { get; private set; }

    /// <summary>
    /// True when participant is at P4 on all required benchmarks OR requiredMetPct >= 85%.
    /// </summary>
    public bool IsReadyToGraduate { get; private set; }

    public DateTimeOffset? DecisionDate { get; private set; }
    public Guid? ApprovedByUserId { get; private set; }
    public string? Notes { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTimeOffset? GraduationDate { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public Participant? Participant { get; private set; }

    public static GraduationDecision Create(
        Guid participantId, Guid projectId, Guid orgId,
        decimal requiredMetPercentage, string? notes = null)
    {
        var isReady = requiredMetPercentage >= 85m;

        return new GraduationDecision
        {
            ParticipantId = participantId,
            ProjectId = projectId,
            RequiredMetPercentage = requiredMetPercentage,
            IsReadyToGraduate = isReady,
            Notes = notes,
            OrganizationId = orgId
        };
    }

    /// <summary>
    /// Approve graduation. Irreversible per REQ-GRAD-005.
    /// </summary>
    public void Approve(Guid approvedByUserId)
    {
        if (Status != GraduationDecisionStatus.Pending)
            throw new InvalidOperationException("Only pending decisions can be approved.");
        if (!IsReadyToGraduate)
            throw new InvalidOperationException(
                "Participant is not ready to graduate (requiredMetPct < 85%).");

        Status = GraduationDecisionStatus.Approved;
        ApprovedByUserId = approvedByUserId;
        DecisionDate = DateTimeOffset.UtcNow;
        GraduationDate = DateTimeOffset.UtcNow;

        AddDomainEvent(new ParticipantGraduatedEvent(ParticipantId, ProjectId, Id));
    }

    /// <summary>
    /// Reject graduation decision.
    /// </summary>
    public void Reject(string reason)
    {
        if (Status != GraduationDecisionStatus.Pending)
            throw new InvalidOperationException("Only pending decisions can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));

        Status = GraduationDecisionStatus.Rejected;
        RejectionReason = reason;
        DecisionDate = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Update readiness calculation when new assessments come in.
    /// </summary>
    public void UpdateReadiness(decimal requiredMetPercentage)
    {
        if (Status == GraduationDecisionStatus.Approved)
            throw new InvalidOperationException("Cannot update an approved graduation decision.");
        RequiredMetPercentage = requiredMetPercentage;
        IsReadyToGraduate = requiredMetPercentage >= 85m;
    }
}
