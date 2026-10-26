using MediatR;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskStatus;

public sealed record UpdateTaskStatusCommand(
    Guid TaskId,
    TaskItemStatus Status) : IRequest<Unit>;
