using MediatR;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.UpdateMealPlanSection;

public sealed record UpdateMealPlanSectionCommand(
    Guid MealPlanId,
    int SectionNumber,
    string? Content) : IRequest;
