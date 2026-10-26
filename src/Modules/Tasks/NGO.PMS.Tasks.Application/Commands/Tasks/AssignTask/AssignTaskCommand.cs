using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.AssignTask;

public sealed record AssignTaskCommand(
    Guid TaskId,
    Guid AssignedToUserId,
    string AssignedToName,
    string? Role = null) : IRequest<Guid>;
