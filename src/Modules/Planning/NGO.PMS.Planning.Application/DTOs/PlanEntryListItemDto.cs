namespace NGO.PMS.Planning.Application.DTOs;

public class PlanEntryListItemDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int? FiscalYear { get; set; }
    public int? Quarter { get; set; }
    public int? Month { get; set; }
    public int? WeekNumber { get; set; }
    public DateTimeOffset PlannedStartDate { get; set; }
    public DateTimeOffset PlannedEndDate { get; set; }
    public decimal PlannedBudget { get; set; }
    public decimal ActualBudget { get; set; }
    public int BeneficiariesMale { get; set; }
    public int BeneficiariesFemale { get; set; }
    public int TotalBeneficiaries { get; set; }
    public string Status { get; set; } = string.Empty;
    public string ApprovalStatus { get; set; } = string.Empty;
    public int ProgressPercentage { get; set; }
    public int ChildCount { get; set; }
}
