using MediatR;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Queries.GetGeneratedReports;

public sealed record GetGeneratedReportsQuery(
    Guid? ReportTemplateId,
    DateTimeOffset? DateFrom,
    DateTimeOffset? DateTo) : IRequest<List<GeneratedReportDto>>;
