using MediatR;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.ShareReport;

public sealed record ShareReportCommand(
    Guid GeneratedReportId,
    List<Guid> RecipientUserIds) : IRequest;
