using MediatR;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.ListMealPlans;

public sealed record ListMealPlansQuery(
    Guid? ProjectId,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<MealPlanDto>>;
