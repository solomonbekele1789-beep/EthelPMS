using MediatR;

namespace NGO.PMS.Risk.Application.Risks.Commands.ResolveRisk;

public sealed record ResolveRiskCommand(Guid RiskId) : IRequest<Guid>;
