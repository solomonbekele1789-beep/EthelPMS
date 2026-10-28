using MediatR;
using NGO.PMS.SystemReports.Domain.Enums;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.CreateReportTemplate;

public sealed record CreateReportTemplateCommand(
    string Name,
    string? Description,
    string Module,
    ReportFormat ReportFormat,
    string QueryDefinition,
    string? TemplateContent,
    bool IsSystemTemplate) : IRequest<Guid>;
