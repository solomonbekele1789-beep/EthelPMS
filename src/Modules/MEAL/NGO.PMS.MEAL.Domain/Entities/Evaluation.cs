using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.MEAL.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// Evaluation entity per REQ-MEAL-013 with DAC criteria classification.
/// Supports monitoring, evaluation, and learning activity types.
/// </summary>
public class Evaluation : AuditableEntity, ISoftDeletable
{
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid ProjectId { get; private set; }
    public EvaluationType EvaluationType { get; private set; }
    public EvaluationStatus Status { get; private set; } = EvaluationStatus.Planned;
    public DacCriteria? PrimaryDacCriteria { get; private set; }

    public DateTimeOffset PlannedStartDate { get; private set; }
    public DateTimeOffset PlannedEndDate { get; private set; }
    public DateTimeOffset? ActualStartDate { get; private set; }
    public DateTimeOffset? ActualEndDate { get; private set; }
    public decimal? Budget { get; private set; }

    // Personnel
    public Guid? LeadEvaluatorUserId { get; private set; }
    public string? ExternalEvaluator { get; private set; }
    public string? Methodology { get; private set; }
    public string? Scope { get; private set; }
    public string? KeyQuestions { get; private set; }

    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public ICollection<EvaluationFinding> Findings { get; private set; } = [];

    public static Evaluation Create(
        string title, Guid projectId, EvaluationType type,
        DateTimeOffset plannedStart, DateTimeOffset plannedEnd, Guid orgId,
        DacCriteria? dacCriteria = null, decimal? budget = null,
        string? description = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Evaluation title is required.", nameof(title));
        if (plannedEnd <= plannedStart)
            throw new ArgumentException("End date must be after start date.", nameof(plannedEnd));

        return new Evaluation
        {
            Title = title.Trim(),
            Description = description,
            ProjectId = projectId,
            EvaluationType = type,
            PrimaryDacCriteria = dacCriteria,
            PlannedStartDate = plannedStart,
            PlannedEndDate = plannedEnd,
            Budget = budget,
            OrganizationId = orgId
        };
    }

    public void StartEvaluation(DateTimeOffset actualStart)
    {
        if (Status != EvaluationStatus.Planned)
            throw new InvalidOperationException("Only Planned evaluations can be started.");
        Status = EvaluationStatus.InProgress;
        ActualStartDate = actualStart;
    }

    public void Complete(DateTimeOffset actualEnd)
    {
        if (Status != EvaluationStatus.InProgress)
            throw new InvalidOperationException("Only InProgress evaluations can be completed.");
        Status = EvaluationStatus.Completed;
        ActualEndDate = actualEnd;
        AddDomainEvent(new EvaluationCompletedEvent(Id, ProjectId));
    }

    public void Cancel()
    {
        if (Status == EvaluationStatus.Completed)
            throw new InvalidOperationException("Completed evaluations cannot be cancelled.");
        Status = EvaluationStatus.Cancelled;
    }

    public void Update(string title, string? description, string? methodology,
        string? scope, string? keyQuestions, decimal? budget)
    {
        if (Status == EvaluationStatus.Completed)
            throw new InvalidOperationException("Completed evaluations cannot be edited.");
        Title = title.Trim();
        Description = description;
        Methodology = methodology;
        Scope = scope;
        KeyQuestions = keyQuestions;
        Budget = budget;
    }

    public void AssignLead(Guid? userId, string? externalEvaluator)
    {
        LeadEvaluatorUserId = userId;
        ExternalEvaluator = externalEvaluator;
    }
}
