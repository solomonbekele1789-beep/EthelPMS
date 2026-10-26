using MediatR;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Templates.Commands.CreateReportTemplate;

public sealed record CreateReportTemplateCommand(
    string Name,
    ReportType ReportType,
    string? Description,
    int RequiredApprovalLevels,
    int SubmissionDeadlineDays) : IRequest<Guid>;
