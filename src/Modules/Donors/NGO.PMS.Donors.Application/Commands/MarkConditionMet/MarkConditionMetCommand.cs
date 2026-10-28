using MediatR;

namespace NGO.PMS.Donors.Application.Commands.MarkConditionMet;

public sealed record MarkConditionMetCommand(Guid ConditionId, string? Notes) : IRequest<Unit>;
