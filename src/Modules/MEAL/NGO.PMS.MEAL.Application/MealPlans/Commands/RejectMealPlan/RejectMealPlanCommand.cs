using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.RejectMealPlan;

public sealed record RejectMealPlanCommand(Guid MealPlanId, string Reason) : IRequest;
