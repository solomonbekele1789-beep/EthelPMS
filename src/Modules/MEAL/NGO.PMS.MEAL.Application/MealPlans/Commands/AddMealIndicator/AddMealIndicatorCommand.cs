using MediatR;
using NGO.PMS.MEAL.Domain.Enums;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.AddMealIndicator;

public sealed record AddMealIndicatorCommand(
    Guid MealPlanId,
    string Name,
    IndicatorLevel Level,
    CollectionFrequency CollectionFrequency,
    Guid? IndicatorId,
    decimal? BaselineValue,
    decimal? TargetValue) : IRequest<Guid>;
