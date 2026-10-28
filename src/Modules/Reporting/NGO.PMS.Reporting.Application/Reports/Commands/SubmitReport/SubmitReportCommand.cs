using MediatR;

namespace NGO.PMS.Reporting.Application.Reports.Commands.SubmitReport;

public sealed record SubmitReportCommand(Guid ReportId) : IRequest;
