using MediatR;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.GenerateReport;

public sealed record GenerateReportCommand(
    Guid ReportTemplateId,
    string? Parameters) : IRequest<Guid>;
