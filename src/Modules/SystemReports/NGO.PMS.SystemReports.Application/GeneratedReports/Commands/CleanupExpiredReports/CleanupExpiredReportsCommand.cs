using MediatR;

namespace NGO.PMS.SystemReports.Application.GeneratedReports.Commands.CleanupExpiredReports;

public sealed record CleanupExpiredReportsCommand() : IRequest<int>;
