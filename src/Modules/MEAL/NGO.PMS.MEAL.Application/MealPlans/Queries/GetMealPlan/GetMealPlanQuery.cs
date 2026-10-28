using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.GetMealPlan;

public sealed record GetMealPlanQuery(Guid MealPlanId) : IRequest<MealPlanDto>;
