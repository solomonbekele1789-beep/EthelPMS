using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// MEAL Plan with 8-section structure per REQ-MEAL-001.
/// Sections: Results &amp; Indicators, Data Quality, Indicator Progress Plans,
/// Learning Plan, MEL Activities, MEL Budget, Reporting Plan, Communication Plan.
/// Completeness scoring (0-100) across 8 dimensions per REQ-MEAL-010.
/// </summary>
public class MealPlan : AuditableEntity, ISoftDeletable
{
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid ProjectId { get; private set; }
    public MealPlanStatus Status { get; private set; } = MealPlanStatus.Draft;

    // 8-section content (JSON-friendly text for flexible section structures)
    public string? ResultsAndIndicators { get; private set; }
    public string? DataQuality { get; private set; }
    public string? IndicatorProgressPlans { get; private set; }
    public string? LearningPlan { get; private set; }
    public string? MelActivities { get; private set; }
    public string? MelBudget { get; private set; }
    public string? ReportingPlan { get; private set; }
    public string? CommunicationPlan { get; private set; }

    // Completeness scoring (REQ-MEAL-010): 0-100 per section
    public int CompletenessResultsIndicators { get; private set; }
    public int CompletenessDataQuality { get; private set; }
    public int CompletenessProgressPlans { get; private set; }
    public int CompletenessLearningPlan { get; private set; }
    public int CompletenessMelActivities { get; private set; }
    public int CompletenessMelBudget { get; private set; }
    public int CompletenessReportingPlan { get; private set; }
    public int CompletenessCommunicationPlan { get; private set; }

    // Approval
    public Guid? SubmittedBy { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }
    public string? RejectionReason { get; private set; }

    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<MealIndicator> Indicators { get; private set; } = [];

    /// <summary>
    /// Overall completeness score (average of 8 section scores).
    /// </summary>
    public int OverallCompleteness => (CompletenessResultsIndicators + CompletenessDataQuality
        + CompletenessProgressPlans + CompletenessLearningPlan + CompletenessMelActivities
        + CompletenessMelBudget + CompletenessReportingPlan + CompletenessCommunicationPlan) / 8;

    public static MealPlan Create(string title, Guid projectId, Guid orgId, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("MEAL plan title is required.", nameof(title));

        var plan = new MealPlan
        {
            Title = title.Trim(),
            Description = description,
            ProjectId = projectId,
            OrganizationId = orgId,
            Status = MealPlanStatus.Draft
        };
        plan.AddDomainEvent(new MealPlanCreatedEvent(plan.Id, projectId));
        return plan;
    }

    public void Update(string title, string? description)
    {
        if (Status == MealPlanStatus.Approved)
            throw new InvalidOperationException("Cannot edit an Approved MEAL plan.");
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("MEAL plan title is required.", nameof(title));
        Title = title.Trim();
        Description = description;
    }

    public void UpdateSection(int sectionNumber, string? content)
    {
        if (Status == MealPlanStatus.Approved)
            throw new InvalidOperationException("Cannot edit an Approved MEAL plan.");

        switch (sectionNumber)
        {
            case 1: ResultsAndIndicators = content; break;
            case 2: DataQuality = content; break;
            case 3: IndicatorProgressPlans = content; break;
            case 4: LearningPlan = content; break;
            case 5: MelActivities = content; break;
            case 6: MelBudget = content; break;
            case 7: ReportingPlan = content; break;
            case 8: CommunicationPlan = content; break;
            default: throw new ArgumentException($"Invalid section number: {sectionNumber}. Must be 1-8.", nameof(sectionNumber));
        }
    }

    public void UpdateCompleteness(int section, int score)
    {
        if (score < 0 || score > 100)
            throw new ArgumentException("Score must be between 0 and 100.", nameof(score));

        switch (section)
        {
            case 1: CompletenessResultsIndicators = score; break;
            case 2: CompletenessDataQuality = score; break;
            case 3: CompletenessProgressPlans = score; break;
            case 4: CompletenessLearningPlan = score; break;
            case 5: CompletenessMelActivities = score; break;
            case 6: CompletenessMelBudget = score; break;
            case 7: CompletenessReportingPlan = score; break;
            case 8: CompletenessCommunicationPlan = score; break;
            default: throw new ArgumentException($"Invalid section: {section}. Must be 1-8.", nameof(section));
        }
    }

    public void Submit(Guid submittedByUserId)
    {
        if (Status != MealPlanStatus.Draft && Status != MealPlanStatus.Rejected)
            throw new InvalidOperationException("Only Draft or Rejected MEAL plans can be submitted.");
        Status = MealPlanStatus.Submitted;
        SubmittedBy = submittedByUserId;
        SubmittedAt = DateTimeOffset.UtcNow;
        RejectionReason = null;
    }

    public void Approve(Guid approvedByUserId)
    {
        if (Status != MealPlanStatus.Submitted)
            throw new InvalidOperationException("Only Submitted MEAL plans can be approved.");
        Status = MealPlanStatus.Approved;
        ApprovedBy = approvedByUserId;
        ApprovedAt = DateTimeOffset.UtcNow;
        AddDomainEvent(new MealPlanApprovedEvent(Id, approvedByUserId));
    }

    public void Reject(string reason)
    {
        if (Status != MealPlanStatus.Submitted)
            throw new InvalidOperationException("Only Submitted MEAL plans can be rejected.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));
        Status = MealPlanStatus.Rejected;
        RejectionReason = reason;
    }
}
