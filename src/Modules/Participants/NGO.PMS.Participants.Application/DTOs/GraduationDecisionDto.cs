namespace NGO.PMS.Participants.Application.DTOs;

public class GraduationDecisionDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal RequiredMetPercentage { get; set; }
    public bool IsReadyToGraduate { get; set; }
    public DateTimeOffset? DecisionDate { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset? GraduationDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
