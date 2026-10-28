using FluentValidation;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateMitigation;

public class CreateMitigationCommandValidator : AbstractValidator<CreateMitigationCommand>
{
    public CreateMitigationCommandValidator()
    {
        RuleFor(x => x.RiskId).NotEmpty();
        RuleFor(x => x.Action).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PlannedDate).NotEmpty();
    }
}
