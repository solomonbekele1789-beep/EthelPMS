using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.CompleteComplianceCheck;

public sealed class CompleteComplianceCheckCommandValidator : AbstractValidator<CompleteComplianceCheckCommand>
{
    public CompleteComplianceCheckCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Score).InclusiveBetween(0, 100);
        RuleFor(x => x.Findings).NotEmpty().MaximumLength(4000);
    }
}
