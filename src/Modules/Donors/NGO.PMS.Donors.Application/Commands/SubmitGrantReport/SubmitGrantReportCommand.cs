using MediatR;

namespace NGO.PMS.Donors.Application.Commands.SubmitGrantReport;

public sealed record SubmitGrantReportCommand(Guid ReportId, string? FileUrl) : IRequest<Unit>;
