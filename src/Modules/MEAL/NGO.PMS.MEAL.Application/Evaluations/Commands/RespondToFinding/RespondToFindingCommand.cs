using MediatR;

namespace NGO.PMS.MEAL.Application.Evaluations.Commands.RespondToFinding;

public sealed record RespondToFindingCommand(
    Guid FindingId,
    string Response,
    Guid ResponsibleUserId,
    DateTimeOffset? DueDate) : IRequest;
