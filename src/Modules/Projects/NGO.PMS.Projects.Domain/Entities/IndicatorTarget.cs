using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Periodic target for an indicator (e.g., yearly or quarterly target).
/// </summary>
public class IndicatorTarget : BaseEntity
{
    public Guid IndicatorId { get; set; }
    public string Period { get; private set; } = string.Empty;
    public decimal TargetValue { get; private set; }
    public decimal? ActualValue { get; private set; }

    // Navigation
    public Indicator Indicator { get; set; } = null!;

    public static IndicatorTarget Create(Guid indicatorId, string period, decimal targetValue)
    {
        return new IndicatorTarget
        {
            IndicatorId = indicatorId,
            Period = period.Trim(),
            TargetValue = targetValue
        };
    }

    public void RecordActual(decimal actualValue) => ActualValue = actualValue;
    public void UpdateTarget(decimal targetValue) => TargetValue = targetValue;
}
