using NGO.PMS.Planning.Domain.Enums;
using NGO.PMS.Planning.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Unified planning entity supporting 5-level hierarchy:
/// Annual → Quarterly → Monthly → Weekly → Daily.
/// Self-referencing via ParentId. Linked to a Project.
/// </summary>
public class PlanEntry : AuditableEntity, ISoftDeletable
{
    public PlanLevel Level { get; private set; }
    public Guid ProjectId { get; set; }
    public Guid? ParentId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // Period designators (relevant per level)
    public int? FiscalYear { get; private set; }          // Annual
    public int? Quarter { get; private set; }              // Quarterly (1-4)
    public int? Month { get; private set; }                // Monthly (1-12)
    public int? WeekNumber { get; private set; }           // Weekly (1-53)
    public DateTimeOffset? DayDate { get; private set; }   // Daily

    // Date range
    public DateTimeOffset PlannedStartDate { get; private set; }
    public DateTimeOffset PlannedEndDate { get; private set; }
    public DateTimeOffset? ActualStartDate { get; private set; }
    public DateTimeOffset? ActualEndDate { get; private set; }

    // Budget
    public decimal PlannedBudget { get; private set; }
    public decimal ActualBudget { get; private set; }

    // Beneficiary disaggregation
    public int BeneficiariesMale { get; private set; }
    public int BeneficiariesFemale { get; private set; }
    public int TotalBeneficiaries => BeneficiariesMale + BeneficiariesFemale;

    // Status
    public PlanStatus Status { get; private set; } = PlanStatus.NotStarted;
    public int ProgressPercentage { get; private set; }

    // Approval workflow
    public ApprovalStatus ApprovalStatus { get; private set; } = ApprovalStatus.Draft;
    public Guid? SubmittedBy { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }
    public string? RejectionReason { get; private set; }

    // Tenant
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public PlanEntry? Parent { get; set; }
    public ICollection<PlanEntry> Children { get; private set; } = [];
    public ICollection<PlanIndicatorAllocation> IndicatorAllocations { get; private set; } = [];
    public ICollection<PlanActivity> PlanActivities { get; private set; } = [];

    // Max children per level
    private static readonly Dictionary<PlanLevel, int> MaxChildrenByLevel = new()
    {
        { PlanLevel.Annual, 4 },     // max 4 quarters
        { PlanLevel.Quarterly, 3 },  // max 3 months per quarter
        { PlanLevel.Monthly, 5 },    // max 5 weeks per month
        { PlanLevel.Weekly, 7 },     // max 7 days per week
        { PlanLevel.Daily, 0 }       // no children
    };

    // Valid child level mapping
    private static readonly Dictionary<PlanLevel, PlanLevel> ChildLevelMap = new()
    {
        { PlanLevel.Annual, PlanLevel.Quarterly },
        { PlanLevel.Quarterly, PlanLevel.Monthly },
        { PlanLevel.Monthly, PlanLevel.Weekly },
        { PlanLevel.Weekly, PlanLevel.Daily }
    };

    public static PlanEntry Create(
        PlanLevel level, string title, Guid projectId, Guid orgId,
        DateTimeOffset plannedStart, DateTimeOffset plannedEnd, decimal plannedBudget,
        Guid? parentId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Plan title is required.", nameof(title));
        if (plannedEnd <= plannedStart)
            throw new ArgumentException("End date must be after start date.", nameof(plannedEnd));
        if (plannedBudget < 0)
            throw new ArgumentException("Budget cannot be negative.", nameof(plannedBudget));

        var plan = new PlanEntry
        {
            Level = level,
            Title = title.Trim(),
            ProjectId = projectId,
            OrganizationId = orgId,
            ParentId = parentId,
            PlannedStartDate = plannedStart,
            PlannedEndDate = plannedEnd,
            PlannedBudget = plannedBudget,
            Status = PlanStatus.NotStarted,
            ApprovalStatus = ApprovalStatus.Draft
        };
        plan.AddDomainEvent(new PlanCreatedEvent(plan.Id, level.ToString(), projectId));
        return plan;
    }

    public void Update(string title, string? description,
        DateTimeOffset plannedStart, DateTimeOffset plannedEnd, decimal plannedBudget)
    {
        if (ApprovalStatus == ApprovalStatus.Approved)
            throw new InvalidOperationException("Approved plans cannot be edited directly.");
        Title = title.Trim();
        Description = description;
        PlannedStartDate = plannedStart;
        PlannedEndDate = plannedEnd;
        PlannedBudget = plannedBudget;
    }

    public void SetPeriodDesignators(int? fiscalYear, int? quarter, int? month, int? weekNumber, DateTimeOffset? dayDate)
    {
        FiscalYear = fiscalYear;
        Quarter = quarter;
        Month = month;
        WeekNumber = weekNumber;
        DayDate = dayDate;
    }

    public void UpdateBeneficiaries(int male, int female)
    {
        BeneficiariesMale = male;
        BeneficiariesFemale = female;
    }

    public void UpdateProgress(PlanStatus status, int progressPercentage)
    {
        if (progressPercentage < 0 || progressPercentage > 100)
            throw new ArgumentException("Progress must be 0-100.", nameof(progressPercentage));
        Status = status;
        ProgressPercentage = progressPercentage;
    }

    public void SetActualDates(DateTimeOffset? actualStart, DateTimeOffset? actualEnd)
    {
        ActualStartDate = actualStart;
        ActualEndDate = actualEnd;
    }

    public void SetActualBudget(decimal actualBudget) => ActualBudget = actualBudget;

    public void Submit(Guid submittedBy)
    {
        if (ApprovalStatus != ApprovalStatus.Draft && ApprovalStatus != ApprovalStatus.Rejected)
            throw new InvalidOperationException("Only draft or rejected plans can be submitted.");
        ApprovalStatus = ApprovalStatus.Submitted;
        SubmittedBy = submittedBy;
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    public void Approve(Guid approvedBy)
    {
        if (ApprovalStatus != ApprovalStatus.Submitted)
            throw new InvalidOperationException("Only submitted plans can be approved.");
        ApprovalStatus = ApprovalStatus.Approved;
        ApprovedBy = approvedBy;
        ApprovedAt = DateTimeOffset.UtcNow;
        RejectionReason = null;
        AddDomainEvent(new PlanApprovedEvent(Id, Level.ToString(), approvedBy));
    }

    public void Reject(string reason)
    {
        if (ApprovalStatus != ApprovalStatus.Submitted)
            throw new InvalidOperationException("Only submitted plans can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));
        ApprovalStatus = ApprovalStatus.Rejected;
        RejectionReason = reason;
    }

    /// <summary>
    /// Validates that a child can be added to this plan entry.
    /// </summary>
    public void ValidateChildAddition(PlanLevel childLevel, int currentChildCount)
    {
        if (Level == PlanLevel.Daily)
            throw new InvalidOperationException("Daily plans cannot have children.");
        if (!ChildLevelMap.TryGetValue(Level, out var expectedChildLevel) || expectedChildLevel != childLevel)
            throw new InvalidOperationException($"A {Level} plan can only have {expectedChildLevel} children, not {childLevel}.");
        if (currentChildCount >= MaxChildrenByLevel[Level])
            throw new InvalidOperationException($"A {Level} plan can have at most {MaxChildrenByLevel[Level]} children.");
    }

    /// <summary>
    /// Validates that a child's date range falls within this plan's date range.
    /// </summary>
    public void ValidateChildDates(DateTimeOffset childStart, DateTimeOffset childEnd)
    {
        if (childStart < PlannedStartDate || childEnd > PlannedEndDate)
            throw new InvalidOperationException("Child plan dates must fall within parent plan dates.");
    }

    /// <summary>
    /// Validates that a child's budget doesn't exceed remaining parent budget.
    /// </summary>
    public void ValidateChildBudget(decimal childBudget, decimal totalExistingChildBudget)
    {
        if (childBudget + totalExistingChildBudget > PlannedBudget)
            throw new InvalidOperationException(
                $"Child budget ({childBudget:N2}) plus existing allocations ({totalExistingChildBudget:N2}) would exceed parent budget ({PlannedBudget:N2}).");
    }
}
