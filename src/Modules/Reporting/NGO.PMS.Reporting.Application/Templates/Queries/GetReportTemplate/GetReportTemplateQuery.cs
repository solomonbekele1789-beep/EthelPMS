using MediatR;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Templates.Queries.GetReportTemplate;

public record GetReportTemplateQuery(Guid TemplateId) : IRequest<ReportTemplateDto>;
