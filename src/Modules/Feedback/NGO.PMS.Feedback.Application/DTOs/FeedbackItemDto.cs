using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.DTOs;

public class FeedbackItemDto
{
    public Guid Id { get; set; }
    public Guid? FeedbackCategoryId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public FeedbackType Type { get; set; }
    public FeedbackStatus Status { get; set; }
    public FeedbackPriority Priority { get; set; }
    public FeedbackChannel Channel { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? SubmitterName { get; set; }
    public string? SubmitterContact { get; set; }
    public Guid? SubmitterUserId { get; set; }
    public bool IsAnonymous { get; set; }
    public bool IsConfidential { get; set; }
    public string? Location { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTime? AcknowledgedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public DateTime SlaResponseDeadline { get; set; }
    public DateTime SlaResolutionDeadline { get; set; }
    public string SlaStatus { get; set; } = string.Empty;
    public int ResponseCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<FeedbackResponseDto> Responses { get; set; } = [];
}
