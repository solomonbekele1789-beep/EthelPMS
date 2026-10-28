using MediatR;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Commands.ReviewPartnerReport;

public sealed record ReviewPartnerReportCommand(
    Guid Id,
    ReportStatus Status,
    string? ReviewComments) : IRequest<Unit>;
