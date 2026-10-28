using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// Lesson learned from project activities, evaluations, or monitoring.
/// Supports categorization and knowledge sharing per REQ-MEAL-005.
/// </summary>
public class LessonLearned : AuditableEntity
{
    public Guid ProjectId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public string? Context { get; private set; }
    public string? ActionTaken { get; private set; }
    public string? Impact { get; private set; }
    public string? RecommendedAction { get; private set; }

    /// <summary>
    /// Optional link to an evaluation finding.
    /// </summary>
    public Guid? EvaluationId { get; private set; }

    public Guid OrganizationId { get; set; }

    public static LessonLearned Create(
        Guid projectId, string title, string description, Guid orgId,
        string? category = null, Guid? evaluationId = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.", nameof(description));

        return new LessonLearned
        {
            ProjectId = projectId,
            Title = title.Trim(),
            Description = description.Trim(),
            Category = category,
            EvaluationId = evaluationId,
            OrganizationId = orgId
        };
    }

    public void Update(string title, string description, string? category,
        string? context, string? actionTaken, string? impact, string? recommendedAction)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        Title = title.Trim();
        Description = description.Trim();
        Category = category;
        Context = context;
        ActionTaken = actionTaken;
        Impact = impact;
        RecommendedAction = recommendedAction;
    }
}
