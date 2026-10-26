using MediatR;
using NGO.PMS.Reporting.Application.DTOs;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Templates.Queries.ListReportTemplates;

public sealed record ListReportTemplatesQuery(ReportType? ReportType) : IRequest<List<ReportTemplateDto>>;
