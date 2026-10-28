namespace NGO.PMS.Planning.Application.DTOs;

public class DipItemDto
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTimeOffset PlannedStartDate { get; set; }
    public DateTimeOffset PlannedEndDate { get; set; }
    public DateTimeOffset? ActualStartDate { get; set; }
    public DateTimeOffset? ActualEndDate { get; set; }
    public decimal BudgetAllocated { get; set; }
    public Guid? ResponsibleUserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<DipMilestoneDto> Milestones { get; set; } = [];
}
