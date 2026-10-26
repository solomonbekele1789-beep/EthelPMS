using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlan;

public sealed record UpdateMealPlanCommand(
    Guid MealPlanId,
    string Title,
    string? Description) : IRequest;
