using MediatR;
using NGO.PMS.Reporting.Application.DTOs;

namespace NGO.PMS.Reporting.Application.Reports.Queries.GetReport;

public sealed record GetReportQuery(Guid ReportId) : IRequest<ReportDto>;
