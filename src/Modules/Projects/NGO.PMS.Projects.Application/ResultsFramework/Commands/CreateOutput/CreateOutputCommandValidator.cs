using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutput;

public class CreateOutputCommandValidator : AbstractValidator<CreateOutputCommand>
{
    public CreateOutputCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.OutcomeId).NotEmpty();
    }
}
