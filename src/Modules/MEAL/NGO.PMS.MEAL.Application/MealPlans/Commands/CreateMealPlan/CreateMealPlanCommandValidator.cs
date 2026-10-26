using FluentValidation;

namespace NGO.PMS.MEAL.Application.MealPlans.Commands.CreateMealPlan;

public class CreateMealPlanCommandValidator : AbstractValidator<CreateMealPlanCommand>
{
    public CreateMealPlanCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
