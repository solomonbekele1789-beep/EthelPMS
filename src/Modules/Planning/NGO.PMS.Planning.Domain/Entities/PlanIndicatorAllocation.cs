using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Domain.Entities;

/// <summary>
/// Allocates indicator targets to a plan entry.
/// Links plan to indicators from the Results Framework.
/// </summary>
public class PlanIndicatorAllocation : BaseEntity
{
    public Guid PlanEntryId { get; set; }
    public Guid IndicatorId { get; set; }
    public decimal TargetValue { get; private set; }
    public decimal? ActualValue { get; private set; }
    public Guid OrganizationId { get; set; }

    // Navigation
    public PlanEntry PlanEntry { get; set; } = null!;

    public static PlanIndicatorAllocation Create(Guid planEntryId, Guid indicatorId, decimal targetValue, Guid orgId)
    {
        if (targetValue < 0) throw new ArgumentException("Target value cannot be negative.", nameof(targetValue));
        return new PlanIndicatorAllocation
        {
            PlanEntryId = planEntryId,
            IndicatorId = indicatorId,
            TargetValue = targetValue,
            OrganizationId = orgId
        };
    }

    public void UpdateActual(decimal actualValue) => ActualValue = actualValue;
    public void UpdateTarget(decimal targetValue) => TargetValue = targetValue;
}
