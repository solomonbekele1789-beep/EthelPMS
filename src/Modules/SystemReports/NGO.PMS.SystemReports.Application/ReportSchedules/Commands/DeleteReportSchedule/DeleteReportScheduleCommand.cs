using MediatR;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.DeleteReportSchedule;

public sealed record DeleteReportScheduleCommand(Guid Id) : IRequest;
