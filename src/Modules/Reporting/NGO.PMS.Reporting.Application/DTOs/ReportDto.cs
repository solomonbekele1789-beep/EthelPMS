namespace NGO.PMS.Reporting.Application.DTOs;

public class ReportDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ReportType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public int? FiscalYear { get; set; }
    public int? Quarter { get; set; }
    public int? Month { get; set; }
    public int? WeekNumber { get; set; }
    public Guid ProjectId { get; set; }
    public Guid? ReportTemplateId { get; set; }
    public Guid? ActivityId { get; set; }

    // Financial
    public decimal PlannedBudget { get; set; }
    public decimal ActualSpent { get; set; }
    public decimal? CumulativeYtdSpent { get; set; }
    public decimal Variance { get; set; }
    public decimal BudgetUtilizationRate { get; set; }

    // Narrative
    public string? ExecutiveSummary { get; set; }
    public string? Challenges { get; set; }
    public string? LessonsLearned { get; set; }
    public string? Recommendations { get; set; }

    // Incident
    public DateTimeOffset? IncidentDate { get; set; }
    public string? IncidentLocation { get; set; }
    public string? IncidentType { get; set; }
    public string? PeopleInvolved { get; set; }
    public string? InjuriesDescription { get; set; }
    public string? ImpactDescription { get; set; }

    // Approval
    public Guid? SubmittedBy { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public int CurrentApprovalLevel { get; set; }
    public int RequiredApprovalLevels { get; set; }
    public Guid? FinalApprovedBy { get; set; }
    public DateTimeOffset? FinalApprovedAt { get; set; }
    public string? RejectionReason { get; set; }

    // Deadline
    public DateTimeOffset? SubmissionDeadline { get; set; }
    public Guid? AssignedToUserId { get; set; }

    // Audit
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }

    // Children
    public List<ReportSectionDto> Sections { get; set; } = [];
    public List<ReportApprovalDto> Approvals { get; set; } = [];
    public List<ReportCommentDto> Comments { get; set; } = [];
}
