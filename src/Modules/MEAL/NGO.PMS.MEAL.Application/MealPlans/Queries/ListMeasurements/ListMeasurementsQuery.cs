using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.ListMeasurements;

public sealed record ListMeasurementsQuery(Guid MealIndicatorId) : IRequest<List<IndicatorMeasurementDto>>;
