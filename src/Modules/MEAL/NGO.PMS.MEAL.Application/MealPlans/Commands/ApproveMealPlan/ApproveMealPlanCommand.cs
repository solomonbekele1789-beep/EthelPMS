using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.ApproveMealPlan;

public sealed record ApproveMealPlanCommand(Guid MealPlanId) : IRequest;
