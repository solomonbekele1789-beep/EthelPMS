using MediatR;
using NGO.PMS.Reporting.Domain.Enums;

namespace NGO.PMS.Reporting.Application.Reports.Commands.CreateReport;

public sealed record CreateReportCommand(
    string Title,
    ReportType ReportType,
    Guid ProjectId,
    DateTimeOffset PeriodStart,
    DateTimeOffset PeriodEnd,
    Guid? ReportTemplateId,
    Guid? ActivityId,
    int? FiscalYear,
    int? Quarter,
    int? Month,
    int? WeekNumber,
    decimal PlannedBudget) : IRequest<Guid>;
