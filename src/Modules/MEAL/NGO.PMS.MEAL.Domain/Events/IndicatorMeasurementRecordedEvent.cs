using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Events;

public sealed record IndicatorMeasurementRecordedEvent(
    Guid MeasurementId,
    Guid MealIndicatorId,
    decimal Value,
    string Period) : IDomainEvent;
