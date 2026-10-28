using FluentValidation;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.CreateReportSchedule;

public class CreateReportScheduleCommandValidator : AbstractValidator<CreateReportScheduleCommand>
{
    public CreateReportScheduleCommandValidator()
    {
        RuleFor(x => x.ReportTemplateId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.CronExpression).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Recipients).NotEmpty();
    }
}
