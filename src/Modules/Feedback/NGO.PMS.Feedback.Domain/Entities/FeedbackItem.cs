using NGO.PMS.Feedback.Domain.Enums;
using NGO.PMS.Feedback.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Feedback.Domain.Entities;

public class FeedbackItem : AuditableEntity, IMultiTenant
{
    public Guid? FeedbackCategoryId { get; private set; }
    public string ReferenceNumber { get; private set; } = string.Empty;
    public FeedbackType Type { get; private set; }
    public FeedbackStatus Status { get; private set; }
    public FeedbackPriority Priority { get; private set; }
    public FeedbackChannel Channel { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public string? SubmitterName { get; private set; }
    public string? SubmitterContact { get; private set; }
    public Guid? SubmitterUserId { get; private set; }
    public bool IsAnonymous { get; private set; }
    public bool IsConfidential { get; private set; }
    public string? Location { get; private set; }
    public Guid? ProjectId { get; private set; }
    public DateTime? AcknowledgedAt { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public string? AssignedToName { get; private set; }
    public DateTime SlaResponseDeadline { get; private set; }
    public DateTime SlaResolutionDeadline { get; private set; }

    public Guid TenantId { get; set; }

    private readonly List<FeedbackResponse> _responses = [];
    public IReadOnlyList<FeedbackResponse> Responses => _responses.AsReadOnly();

    private FeedbackItem() { }

    public static FeedbackItem Create(
        string referenceNumber,
        FeedbackType type,
        FeedbackPriority priority,
        FeedbackChannel channel,
        string description,
        string? submitterName,
        string? submitterContact,
        Guid? submitterUserId,
        bool isAnonymous,
        bool isConfidential,
        string? location,
        Guid? projectId,
        Guid? feedbackCategoryId,
        int slaResponseDays,
        int slaResolutionDays)
    {
        var item = new FeedbackItem
        {
            ReferenceNumber = referenceNumber,
            Type = type,
            Status = FeedbackStatus.New,
            Priority = priority,
            Channel = channel,
            Description = description,
            SubmitterName = submitterName,
            SubmitterContact = submitterContact,
            SubmitterUserId = submitterUserId,
            IsAnonymous = isAnonymous,
            IsConfidential = isConfidential,
            Location = location,
            ProjectId = projectId,
            FeedbackCategoryId = feedbackCategoryId,
            SlaResponseDeadline = DateTime.UtcNow.AddDays(slaResponseDays),
            SlaResolutionDeadline = DateTime.UtcNow.AddDays(slaResolutionDays)
        };

        // Auto-escalate safeguarding concerns
        if (type == FeedbackType.Safeguarding)
        {
            item.Priority = FeedbackPriority.Critical;
            item.IsConfidential = true;
            item.Status = FeedbackStatus.Escalated;
            item.AddDomainEvent(new FeedbackEscalatedEvent(item.Id, "Auto-escalated: Safeguarding concern"));
        }

        item.AddDomainEvent(new FeedbackSubmittedEvent(item.Id, type, isAnonymous));

        return item;
    }

    public void Acknowledge()
    {
        AcknowledgedAt = DateTime.UtcNow;
        Status = FeedbackStatus.Acknowledged;
    }

    public void AssignTo(Guid userId, string name)
    {
        AssignedToUserId = userId;
        AssignedToName = name;
        if (Status == FeedbackStatus.Acknowledged || Status == FeedbackStatus.New)
        {
            Status = FeedbackStatus.UnderReview;
        }
    }

    public void Escalate(string reason)
    {
        Status = FeedbackStatus.Escalated;
        AddDomainEvent(new FeedbackEscalatedEvent(Id, reason));
    }

    public void Resolve()
    {
        if (_responses.Count == 0)
        {
            throw new InvalidOperationException("Cannot resolve feedback without at least one response.");
        }

        ResolvedAt = DateTime.UtcNow;
        Status = FeedbackStatus.Resolved;

        var resolutionDays = (int)(ResolvedAt.Value - CreatedAt.DateTime).TotalDays;
        AddDomainEvent(new FeedbackResolvedEvent(Id, resolutionDays));
    }

    public void Close()
    {
        ClosedAt = DateTime.UtcNow;
        Status = FeedbackStatus.Closed;
    }

    public string ComputeSlaStatus()
    {
        var now = DateTime.UtcNow;

        if (Status == FeedbackStatus.Resolved || Status == FeedbackStatus.Closed)
        {
            return "Resolved";
        }

        if (now > SlaResolutionDeadline)
        {
            return "Breached";
        }

        // At risk if within 20% of remaining time
        var totalDuration = (SlaResolutionDeadline - CreatedAt.DateTime).TotalHours;
        var remaining = (SlaResolutionDeadline - now).TotalHours;
        if (remaining < totalDuration * 0.2)
        {
            return "AtRisk";
        }

        return "OnTrack";
    }
}
