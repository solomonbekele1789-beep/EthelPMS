namespace NGO.PMS.MEAL.Application.DTOs;

public class MealPlanDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ResultsAndIndicators { get; set; }
    public string? DataQuality { get; set; }
    public string? IndicatorProgressPlans { get; set; }
    public string? LearningPlan { get; set; }
    public string? MelActivities { get; set; }
    public string? MelBudget { get; set; }
    public string? ReportingPlan { get; set; }
    public string? CommunicationPlan { get; set; }
    public int CompletenessResultsIndicators { get; set; }
    public int CompletenessDataQuality { get; set; }
    public int CompletenessProgressPlans { get; set; }
    public int CompletenessLearningPlan { get; set; }
    public int CompletenessMelActivities { get; set; }
    public int CompletenessMelBudget { get; set; }
    public int CompletenessReportingPlan { get; set; }
    public int CompletenessCommunicationPlan { get; set; }
    public int OverallCompleteness { get; set; }
    public Guid? SubmittedBy { get; set; }
    public DateTimeOffset? SubmittedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public string? RejectionReason { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<MealIndicatorDto> Indicators { get; set; } = [];
}
