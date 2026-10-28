using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Links a plan entry to results framework elements (outcome/output/activity).
/// Polymorphic: exactly one of OutcomeId, OutputId, or ActivityId should be set.
/// </summary>
public class PlanActivity : AuditableEntity
{
    public Guid PlanEntryId { get; set; }
    public Guid? OutcomeId { get; set; }
    public Guid? OutputId { get; set; }
    public Guid? ActivityId { get; set; }
    public decimal PlannedBudget { get; private set; }
    public Guid? ResponsibleUserId { get; set; }
    public Guid OrganizationId { get; set; }

    // Navigation
    public PlanEntry PlanEntry { get; set; } = null!;

    public static PlanActivity Create(Guid planEntryId, decimal plannedBudget, Guid orgId)
    {
        return new PlanActivity
        {
            PlanEntryId = planEntryId,
            PlannedBudget = plannedBudget,
            OrganizationId = orgId
        };
    }

    public void LinkToOutcome(Guid outcomeId) { OutcomeId = outcomeId; OutputId = null; ActivityId = null; }
    public void LinkToOutput(Guid outputId) { OutputId = outputId; OutcomeId = null; ActivityId = null; }
    public void LinkToActivity(Guid activityId) { ActivityId = activityId; OutcomeId = null; OutputId = null; }

    public void UpdateBudget(decimal budget) => PlannedBudget = budget;
}
