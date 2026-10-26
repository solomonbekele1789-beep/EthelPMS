using MediatR;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.ReportTemplates.Queries.GetReportTemplateById;

public sealed record GetReportTemplateByIdQuery(Guid Id) : IRequest<ReportTemplateDto>;
