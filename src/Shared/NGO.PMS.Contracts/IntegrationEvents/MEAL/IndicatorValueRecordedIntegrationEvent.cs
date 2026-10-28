using NGO.PMS.Contracts.IntegrationEvents;

namespace NGO.PMS.Contracts.IntegrationEvents.MEAL;

/// <summary>
/// Fired when an indicator measurement is recorded.
/// Consumed by: Projects (update indicator progress), Reporting (auto-populate reports).
/// </summary>
public sealed record IndicatorValueRecordedIntegrationEvent : IntegrationEvent
{
    public Guid MeasurementId { get; init; }
    public Guid MealIndicatorId { get; init; }
    public decimal Value { get; init; }
    public string Period { get; init; } = string.Empty;
}
