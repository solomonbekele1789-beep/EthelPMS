using MediatR;

namespace NGO.PMS.Reporting.Application.Templates.Commands.UpdateReportTemplate;

public sealed record UpdateReportTemplateCommand(
    Guid TemplateId,
    string Name,
    string? Description,
    int RequiredApprovalLevels,
    int SubmissionDeadlineDays) : IRequest;
