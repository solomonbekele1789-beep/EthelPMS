using MediatR;
using NGO.PMS.Risk.Domain.Enums;

namespace NGO.PMS.Risk.Application.Risks.Commands.ReassessRisk;

public sealed record ReassessRiskCommand(
    Guid RiskId,
    Likelihood Likelihood,
    Impact Impact) : IRequest<Guid>;
