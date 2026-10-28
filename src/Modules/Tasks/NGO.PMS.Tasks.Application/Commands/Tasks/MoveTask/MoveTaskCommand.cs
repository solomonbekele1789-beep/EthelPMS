using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.MoveTask;

public sealed record MoveTaskCommand(
    Guid TaskId,
    Guid TargetListId,
    int? SortOrder = null) : IRequest<Unit>;
