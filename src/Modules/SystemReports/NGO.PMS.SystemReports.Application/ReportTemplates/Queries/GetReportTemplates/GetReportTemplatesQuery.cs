using MediatR;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplates;

public sealed record GetReportTemplatesQuery(string? Module) : IRequest<List<ReportTemplateDto>>;
