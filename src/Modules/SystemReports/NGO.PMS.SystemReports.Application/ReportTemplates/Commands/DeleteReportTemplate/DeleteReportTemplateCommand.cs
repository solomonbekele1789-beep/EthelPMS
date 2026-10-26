using MediatR;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Commands.DeleteReportTemplate;

public sealed record DeleteReportTemplateCommand(Guid Id) : IRequest;
