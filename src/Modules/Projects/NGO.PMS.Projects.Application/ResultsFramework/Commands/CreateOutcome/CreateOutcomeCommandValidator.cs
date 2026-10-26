using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutcome;

public class CreateOutcomeCommandValidator : AbstractValidator<CreateOutcomeCommand>
{
    public CreateOutcomeCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
