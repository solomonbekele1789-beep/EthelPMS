using NGO.PMS.Reporting.Domain.Enums;
using NGO.PMS.Reporting.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Reporting.Domain.Entities;

/// <summary>
/// A report instance — created from a template, linked to a project and reporting period.
/// Supports multi-level approval workflow (REQ-RPT-008).
/// Only report creator can edit in draft status (REQ-RPT-011).
/// </summary>
public class Report : AuditableEntity, ISoftDeletable
{
    public string Title { get; private set; } = string.Empty;
    public ReportType ReportType { get; private set; }
    public ReportStatus Status { get; private set; } = ReportStatus.Draft;

    // Period
    public DateTimeOffset PeriodStart { get; private set; }
    public DateTimeOffset PeriodEnd { get; private set; }
    public int? FiscalYear { get; private set; }
    public int? Quarter { get; private set; }
    public int? Month { get; private set; }
    public int? WeekNumber { get; private set; }

    // Links
    public Guid ProjectId { get; private set; }
    public Guid? ReportTemplateId { get; private set; }
    public Guid? ActivityId { get; private set; }

    // Financial summary (REQ-RPT-013/014/015)
    public decimal PlannedBudget { get; private set; }
    public decimal ActualSpent { get; private set; }
    public decimal? CumulativeYtdSpent { get; private set; }

    // Narrative (common sections stored directly for convenience)
    public string? ExecutiveSummary { get; private set; }
    public string? Challenges { get; private set; }
    public string? LessonsLearned { get; private set; }
    public string? Recommendations { get; private set; }

    // Incident-specific fields (REQ-RPT-007)
    public DateTimeOffset? IncidentDate { get; private set; }
    public string? IncidentLocation { get; private set; }
    public string? IncidentType { get; private set; }
    public string? PeopleInvolved { get; private set; }
    public string? InjuriesDescription { get; private set; }
    public string? ImpactDescription { get; private set; }

    // Approval tracking
    public Guid? SubmittedBy { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }
    public int CurrentApprovalLevel { get; private set; }
    public int RequiredApprovalLevels { get; private set; } = 1;
    public Guid? FinalApprovedBy { get; private set; }
    public DateTimeOffset? FinalApprovedAt { get; private set; }
    public string? RejectionReason { get; private set; }

    // Deadline (REQ-RPT-019)
    public DateTimeOffset? SubmissionDeadline { get; private set; }
    public Guid? AssignedToUserId { get; private set; }

    // Tenant
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<ReportSection> Sections { get; private set; } = [];
    public ICollection<ReportApproval> Approvals { get; private set; } = [];
    public ICollection<ReportComment> Comments { get; private set; } = [];
    public ReportTemplate? ReportTemplate { get; private set; }

    // Computed properties (REQ-RPT-013/015)
    public decimal Variance => PlannedBudget - ActualSpent;
    public decimal BudgetUtilizationRate => PlannedBudget > 0
        ? Math.Round(ActualSpent / PlannedBudget * 100, 2) : 0;

    public static Report Create(
        string title, ReportType reportType, Guid projectId,
        DateTimeOffset periodStart, DateTimeOffset periodEnd, Guid orgId,
        Guid? templateId = null, int requiredApprovalLevels = 1)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Report title is required.", nameof(title));
        if (periodEnd <= periodStart)
            throw new ArgumentException("Period end must be after period start.", nameof(periodEnd));

        var report = new Report
        {
            Title = title.Trim(),
            ReportType = reportType,
            ProjectId = projectId,
            PeriodStart = periodStart.ToUniversalTime(),
            PeriodEnd = periodEnd.ToUniversalTime(),
            ReportTemplateId = templateId,
            RequiredApprovalLevels = requiredApprovalLevels,
            OrganizationId = orgId,
            Status = ReportStatus.Draft,
            CurrentApprovalLevel = 0
        };
        report.AddDomainEvent(new ReportCreatedEvent(report.Id, reportType, projectId));
        return report;
    }

    public void Update(
        string title, string? executiveSummary, string? challenges,
        string? lessonsLearned, string? recommendations,
        decimal plannedBudget, decimal actualSpent, decimal? cumulativeYtdSpent,
        Guid editorUserId)
    {
        GuardDraftOnly();
        GuardCreatorOnly(editorUserId);

        Title = title.Trim();
        ExecutiveSummary = executiveSummary;
        Challenges = challenges;
        LessonsLearned = lessonsLearned;
        Recommendations = recommendations;
        PlannedBudget = plannedBudget;
        ActualSpent = actualSpent;
        CumulativeYtdSpent = cumulativeYtdSpent;
    }

    public void UpdateIncidentDetails(
        DateTimeOffset incidentDate, string? location, string? type,
        string? peopleInvolved, string? injuries, string? impact)
    {
        if (ReportType != ReportType.Incident)
            throw new InvalidOperationException("Incident details only apply to Incident reports.");
        IncidentDate = incidentDate.ToUniversalTime();
        IncidentLocation = location;
        IncidentType = type;
        PeopleInvolved = peopleInvolved;
        InjuriesDescription = injuries;
        ImpactDescription = impact;
    }

    public void SetPeriodDesignators(int? fiscalYear, int? quarter, int? month, int? weekNumber)
    {
        FiscalYear = fiscalYear;
        Quarter = quarter;
        Month = month;
        WeekNumber = weekNumber;
    }

    public void SetDeadline(DateTimeOffset deadline, Guid? assignedTo = null)
    {
        SubmissionDeadline = deadline.ToUniversalTime();
        AssignedToUserId = assignedTo;
    }

    public void UpdateFinancials(decimal plannedBudget, decimal actualSpent, decimal? cumulativeYtd)
    {
        PlannedBudget = plannedBudget;
        ActualSpent = actualSpent;
        CumulativeYtdSpent = cumulativeYtd;
    }

    // ── Approval Workflow ────────────────────────────────

    public void Submit(Guid submittedByUserId)
    {
        if (Status != ReportStatus.Draft && Status != ReportStatus.Rejected)
            throw new InvalidOperationException("Only Draft or Rejected reports can be submitted.");

        Status = ReportStatus.Submitted;
        SubmittedBy = submittedByUserId;
        SubmittedAt = DateTimeOffset.UtcNow;
        CurrentApprovalLevel = 0;
        RejectionReason = null;

        AddDomainEvent(new ReportSubmittedEvent(Id, ReportType, ProjectId, submittedByUserId));
    }

    public void StartReview(Guid reviewerUserId)
    {
        if (Status != ReportStatus.Submitted)
            throw new InvalidOperationException("Only Submitted reports can be put under review.");
        Status = ReportStatus.UnderReview;
    }

    public void Approve(Guid approverUserId, int approvalLevel, string? comments = null)
    {
        if (Status != ReportStatus.Submitted && Status != ReportStatus.UnderReview)
            throw new InvalidOperationException("Only Submitted or UnderReview reports can be approved.");

        var approval = ReportApproval.Create(Id, approverUserId, approvalLevel,
            ApprovalAction.Approved, comments, OrganizationId);
        Approvals.Add(approval);
        CurrentApprovalLevel = approvalLevel;

        if (approvalLevel >= RequiredApprovalLevels)
        {
            Status = ReportStatus.Approved;
            FinalApprovedBy = approverUserId;
            FinalApprovedAt = DateTimeOffset.UtcNow;
            AddDomainEvent(new ReportApprovedEvent(Id, approverUserId));
        }
        else
        {
            // Still under review — waiting for next level
            Status = ReportStatus.UnderReview;
        }
    }

    public void Reject(Guid rejectorUserId, int approvalLevel, string reason)
    {
        if (Status != ReportStatus.Submitted && Status != ReportStatus.UnderReview)
            throw new InvalidOperationException("Only Submitted or UnderReview reports can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));

        var approval = ReportApproval.Create(Id, rejectorUserId, approvalLevel,
            ApprovalAction.Rejected, reason, OrganizationId);
        Approvals.Add(approval);

        Status = ReportStatus.Rejected;
        RejectionReason = reason;
        AddDomainEvent(new ReportRejectedEvent(Id, reason));
    }

    // ── Guards ───────────────────────────────────────────

    private void GuardDraftOnly()
    {
        if (Status != ReportStatus.Draft)
            throw new InvalidOperationException($"Cannot edit a report in {Status} status. Only Draft reports can be edited.");
    }

    private void GuardCreatorOnly(Guid userId)
    {
        // CreatedBy is set by the AuditableEntityInterceptor as a string;
        // compare as GUID string. Only enforce if CreatedBy is already set.
        if (!string.IsNullOrEmpty(CreatedBy) && CreatedBy != userId.ToString())
            throw new InvalidOperationException("Only the report creator can edit the report.");
    }
}
