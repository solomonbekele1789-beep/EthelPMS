using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskLists.CreateTaskList;

public sealed record CreateTaskListCommand(
    Guid TaskBoardId,
    string Name,
    int SortOrder,
    string? Color = null) : IRequest<Guid>;
