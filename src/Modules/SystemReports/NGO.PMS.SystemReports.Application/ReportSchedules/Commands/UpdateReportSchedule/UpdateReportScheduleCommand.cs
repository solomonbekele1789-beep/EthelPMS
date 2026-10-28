using MediatR;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.UpdateReportSchedule;

public sealed record UpdateReportScheduleCommand(
    Guid Id,
    string Name,
    string CronExpression,
    string Recipients,
    string? Parameters,
    bool IsActive) : IRequest;
