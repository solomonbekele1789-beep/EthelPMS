namespace NGO.PMS.MEAL.Application.DTOs;

public class EvaluationFindingDto
{
    public Guid Id { get; set; }
    public Guid EvaluationId { get; set; }
    public string Finding { get; set; } = string.Empty;
    public string? DacCriteria { get; set; }
    public string? Recommendation { get; set; }
    public string Status { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string? ManagementResponse { get; set; }
    public Guid? ResponsibleUserId { get; set; }
    public DateTimeOffset? ResponseDate { get; set; }
    public DateTimeOffset? DueDate { get; set; }
    public Guid? VerifiedByUserId { get; set; }
    public DateTimeOffset? VerifiedAt { get; set; }
    public string? VerificationNotes { get; set; }
}
