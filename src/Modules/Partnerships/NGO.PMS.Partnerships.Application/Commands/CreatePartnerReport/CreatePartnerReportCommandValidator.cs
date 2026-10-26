using FluentValidation;

namespace NGO.PMS.Partnerships.Application.Commands.CreatePartnerReport;

public sealed class CreatePartnerReportCommandValidator : AbstractValidator<CreatePartnerReportCommand>
{
    public CreatePartnerReportCommandValidator()
    {
        RuleFor(x => x.SubGranteeId).NotEmpty();
        RuleFor(x => x.ReportType).IsInEnum();
        RuleFor(x => x.ReportingPeriodStart).NotEmpty();
        RuleFor(x => x.ReportingPeriodEnd).NotEmpty()
            .GreaterThan(x => x.ReportingPeriodStart)
            .WithMessage("Reporting period end must be after reporting period start.");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
    }
}
