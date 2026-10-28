using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.CreateComplianceCheck;

public sealed class CreateComplianceCheckCommandValidator : AbstractValidator<CreateComplianceCheckCommand>
{
    public CreateComplianceCheckCommandValidator()
    {
        RuleFor(x => x.SubGranteeId).NotEmpty();
        RuleFor(x => x.ComplianceType).IsInEnum();
        RuleFor(x => x.CheckDate).NotEmpty();
        RuleFor(x => x.AssessorId).NotEmpty();
    }
}
