using FluentValidation;

namespace NGO.PMS.Reporting.Application.Templates.Commands.CreateReportTemplate;

public class CreateReportTemplateCommandValidator : AbstractValidator<CreateReportTemplateCommand>
{
    public CreateReportTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.RequiredApprovalLevels).GreaterThanOrEqualTo(1);
        RuleFor(x => x.SubmissionDeadlineDays).GreaterThanOrEqualTo(1);
    }
}
