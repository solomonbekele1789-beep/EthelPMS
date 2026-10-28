using MediatR;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.UpdateReportTemplate;

public sealed record UpdateReportTemplateCommand(
    Guid Id,
    string Name,
    string? Description,
    string QueryDefinition,
    string? TemplateContent,
    bool IsActive) : IRequest;
