using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.RecordMeasurement;

public sealed record RecordMeasurementCommand(
    Guid MealIndicatorId,
    string Period,
    decimal Value,
    DateTimeOffset MeasurementDate,
    string? Notes,
    decimal? Male,
    decimal? Female) : IRequest<Guid>;
