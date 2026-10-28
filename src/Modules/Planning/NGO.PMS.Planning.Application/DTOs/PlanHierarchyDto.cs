namespace NGO.PMS.Planning.Application.DTOs;

public class PlanHierarchyDto
{
    public Guid Id { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public decimal PlannedBudget { get; set; }
    public List<PlanHierarchyDto> Children { get; set; } = [];
}
