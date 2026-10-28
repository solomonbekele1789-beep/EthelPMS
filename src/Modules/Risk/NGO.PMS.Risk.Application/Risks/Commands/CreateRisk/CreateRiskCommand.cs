using MediatR;
using NGO.PMS.Risk.Domain.Enums;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateRisk;

public sealed record CreateRiskCommand(
    Guid ProjectId,
    string Title,
    string Description,
    Likelihood Likelihood,
    Impact Impact,
    Guid? RiskCategoryId = null,
    string? Owner = null,
    Guid? OwnerUserId = null,
    string? Location = null,
    string? ResidualRiskNotes = null) : IRequest<Guid>;
