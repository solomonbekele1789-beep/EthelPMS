namespace NGO.PMS.Planning.Application.DTOs;

public class PlanEntryDto
{
    public Guid Id { get; set; }
    public string Level { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public Guid? ParentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? FiscalYear { get; set; }
    public int? Quarter { get; set; }
    public int? Month { get; set; }
    public int? WeekNumber { get; set; }
    public DateTimeOffset? DayDate { get; set; }
    public DateTimeOffset PlannedStartDate { get; set; }
    public DateTimeOffset PlannedEndDate { get; set; }
    public DateTimeOffset? ActualStartDate { get; set; }
    public DateTimeOffset? ActualEndDate { get; set; }
    public decimal PlannedBudget { get; set; }
    public decimal ActualBudget { get; set; }
    public int BeneficiariesMale { get; set; }
    public int BeneficiariesFemale { get; set; }
    public int TotalBeneficiaries { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public string ApprovalStatus { get; set; } = string.Empty;
    public Guid? SubmittedBy { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public List<PlanIndicatorAllocationDto> IndicatorAllocations { get; set; } = [];
    public List<PlanActivityDto> PlanActivities { get; set; } = [];
}
