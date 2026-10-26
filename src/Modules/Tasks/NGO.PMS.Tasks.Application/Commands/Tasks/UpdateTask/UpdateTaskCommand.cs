using MediatR;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTask;

public sealed record UpdateTaskCommand(
    Guid TaskId,
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate) : IRequest<Unit>;
