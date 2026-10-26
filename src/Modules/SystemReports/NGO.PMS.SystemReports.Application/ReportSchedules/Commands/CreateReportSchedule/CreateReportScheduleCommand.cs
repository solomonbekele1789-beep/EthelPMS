using MediatR;

namespace NGO.PMS.SystemReports.Application.ReportSchedules.Commands.CreateReportSchedule;

public sealed record CreateReportScheduleCommand(
    Guid ReportTemplateId,
    string Name,
    string CronExpression,
    string Recipients,
    string? Parameters) : IRequest<Guid>;
