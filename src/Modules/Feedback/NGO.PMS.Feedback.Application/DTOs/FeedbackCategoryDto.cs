using NGO.PMS.Feedback.Domain.Enums;

namespace NGO.PMS.Feedback.Application.DTOs;

public class FeedbackCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public FeedbackType DefaultType { get; set; }
    public int SlaResponseDays { get; set; }
    public int SlaResolutionDays { get; set; }
    public bool RequiresEscalation { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}
