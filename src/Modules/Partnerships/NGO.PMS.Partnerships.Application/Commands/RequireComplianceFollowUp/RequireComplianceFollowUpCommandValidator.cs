using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.RequireComplianceFollowUp;

public sealed class RequireComplianceFollowUpCommandValidator : AbstractValidator<RequireComplianceFollowUpCommand>
{
    public RequireComplianceFollowUpCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FollowUpDate).NotEmpty();
        RuleFor(x => x.Recommendations).NotEmpty().MaximumLength(4000);
    }
}
