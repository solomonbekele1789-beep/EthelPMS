using MediatR;

namespace NGO.PMS.Risk.Application.Risks.Commands.CreateMitigation;

public sealed record CreateMitigationCommand(
    Guid RiskId,
    string Action,
    DateTime PlannedDate,
    string? ResponsiblePerson = null,
    Guid? ResponsibleUserId = null,
    decimal? EstimatedCost = null,
    string? Notes = null) : IRequest<Guid>;
