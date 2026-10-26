using MediatR;

namespace NGO.PMS.Tasks.Application.Commands.TaskBoards.CreateTaskBoard;

public sealed record CreateTaskBoardCommand(
    string Name,
    Guid ProjectId,
    string? Description,
    bool IsDefault = false) : IRequest<Guid>;
