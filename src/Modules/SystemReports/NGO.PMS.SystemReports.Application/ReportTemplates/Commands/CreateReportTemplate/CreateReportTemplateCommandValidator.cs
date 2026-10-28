using FluentValidation;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.CreateReportTemplate;

public class CreateReportTemplateCommandValidator : AbstractValidator<CreateReportTemplateCommand>
{
    public CreateReportTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Module).NotEmpty().MaximumLength(100);
        RuleFor(x => x.QueryDefinition).NotEmpty();
    }
}
