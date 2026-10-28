using MediatR;
using NGO.PMS.SystemReports.Application.DTOs;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Queries.GetReportSchedules;

public sealed record GetReportSchedulesQuery() : IRequest<List<ReportScheduleDto>>;
