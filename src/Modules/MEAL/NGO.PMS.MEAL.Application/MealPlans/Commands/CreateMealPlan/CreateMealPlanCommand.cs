using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.CreateMealPlan;

public sealed record CreateMealPlanCommand(
    string Title,
    Guid ProjectId,
    string? Description) : IRequest<Guid>;
