using FluentValidation;

namespace NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;

public class CreateReportCommandValidator : AbstractValidator<CreateReportCommand>
{
    public CreateReportCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.ReportType).IsInEnum();
        RuleFor(x => x.PeriodStart).NotEmpty();
        RuleFor(x => x.PeriodEnd).NotEmpty().GreaterThan(x => x.PeriodStart)
            .WithMessage("Period end must be after period start.");
        RuleFor(x => x.PlannedBudget).GreaterThanOrEqualTo(0);
    }
}
