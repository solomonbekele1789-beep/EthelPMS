using MediatR;

namespace NGO.PMS.Donors.Application.Commands.AddGrantCondition;

public sealed record AddGrantConditionCommand(
    Guid GrantId,
    string Description,
    DateTime DueDate) : IRequest<Guid>;
