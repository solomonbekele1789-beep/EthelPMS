using FluentValidation;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.CreateEvaluation;

public class CreateEvaluationCommandValidator : AbstractValidator<CreateEvaluationCommand>
{
    public CreateEvaluationCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.PlannedEndDate).GreaterThan(x => x.PlannedStartDate)
            .WithMessage("Planned end date must be after planned start date.");
    }
}
