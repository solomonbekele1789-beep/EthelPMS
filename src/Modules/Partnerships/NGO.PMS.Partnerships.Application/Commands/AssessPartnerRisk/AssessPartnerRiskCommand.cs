using MediatR;
using NGO.PMS.Partnerships.Domain.Enums;

namespace NGO.PMS.Partnerships.Application.Commands.AssessPartnerRisk;

public sealed record AssessPartnerRiskCommand(
    Guid Id,
    PartnerRiskRating RiskRating,
    int? CapacityScore) : IRequest<Unit>;
