using MediatR;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.CreateTask;

public sealed record CreateTaskCommand(
    Guid TaskListId,
    string Title,
    Guid? ProjectId = null,
    string? Description = null,
    TaskPriority Priority = TaskPriority.Medium,
    DateTime? DueDate = null,
    Guid? AssignedToUserId = null,
    string? AssignedToName = null,
    Guid? ParentTaskId = null,
    int SortOrder = 0) : IRequest<Guid>;
