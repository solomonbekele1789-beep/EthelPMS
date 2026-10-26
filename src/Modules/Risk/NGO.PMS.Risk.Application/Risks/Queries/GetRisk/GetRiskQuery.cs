using MediatR;
using NGO.PMS.Risk.Application.DTOs;

namespace NGO.PMS.Risk.Application.Risks.Queries.GetRisk;

public sealed record GetRiskQuery(Guid RiskId) : IRequest<RiskDto>;
