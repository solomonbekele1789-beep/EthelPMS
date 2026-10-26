using MediatR;
using NGO.PMS.Risk.Domain.Enums;

namespace NGO.PMS.Risk.Application.Risks.Commands.RecordRiskAssessment;

public sealed record RecordRiskAssessmentCommand(
    Guid RiskId,
    Likelihood Likelihood,
    Impact Impact,
    string? Notes = null,
    string? Source = null) : IRequest<Guid>;
