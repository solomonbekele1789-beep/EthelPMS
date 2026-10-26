using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.RejectReport;

public sealed record RejectReportCommand(Guid ReportId, int ApprovalLevel, string Reason) : IRequest;
