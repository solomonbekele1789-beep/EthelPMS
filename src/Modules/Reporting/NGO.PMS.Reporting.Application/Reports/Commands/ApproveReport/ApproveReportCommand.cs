using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.ApproveReport;

public sealed record ApproveReportCommand(Guid ReportId, int ApprovalLevel, string? Comments) : IRequest;
