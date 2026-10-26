using FluentValidation;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateRisk;

public class CreateRiskCommandValidator : AbstractValidator<CreateRiskCommand>
{
    public CreateRiskCommandValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Likelihood).IsInEnum();
        RuleFor(x => x.Impact).IsInEnum();
    }
}
