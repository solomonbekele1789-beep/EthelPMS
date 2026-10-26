using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.SubmitMealPlan;

public sealed record SubmitMealPlanCommand(Guid MealPlanId) : IRequest;
