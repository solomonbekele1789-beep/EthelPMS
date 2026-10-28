using MediatR;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Commands.CreatePartnerReport;

public sealed record CreatePartnerReportCommand(
    Guid SubGranteeId,
    PartnerReportType ReportType,
    DateTime ReportingPeriodStart,
    DateTime ReportingPeriodEnd,
    string Title) : IRequest<Guid>;
