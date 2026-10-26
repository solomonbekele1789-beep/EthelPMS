using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.ReviewPartnerReport;

public sealed class ReviewPartnerReportCommandValidator : AbstractValidator<ReviewPartnerReportCommand>
{
    public ReviewPartnerReportCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
    }
}
