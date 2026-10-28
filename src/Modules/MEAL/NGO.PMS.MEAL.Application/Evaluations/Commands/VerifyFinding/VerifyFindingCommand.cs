using MediatR;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.VerifyFinding;

public sealed record VerifyFindingCommand(Guid FindingId, string? Notes) : IRequest;
