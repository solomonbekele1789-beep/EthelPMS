using FluentValidation;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateIndicator;

public class CreateIndicatorCommandValidator : AbstractValidator<CreateIndicatorCommand>
{
    public CreateIndicatorCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
    }
}
