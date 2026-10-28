using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.AssessPartnerRisk;

public sealed class AssessPartnerRiskCommandValidator : AbstractValidator<AssessPartnerRiskCommand>
{
    public AssessPartnerRiskCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.RiskRating).IsInEnum();
        RuleFor(x => x.CapacityScore).InclusiveBetween(0, 100)
            .When(x => x.CapacityScore.HasValue);
    }
}
