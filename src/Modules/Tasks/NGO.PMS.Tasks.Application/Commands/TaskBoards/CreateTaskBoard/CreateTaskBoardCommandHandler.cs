using MediatR;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Commands.TaskBoards.CreateTaskBoard;

public sealed class CreateTaskBoardCommandHandler : IRequestHandler<CreateTaskBoardCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTaskBoardCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateTaskBoardCommand request, CancellationToken cancellationToken)
    {
        var board = TaskBoard.Create(
            request.Name,
            request.ProjectId,
            _currentUser.OrganizationId,
            request.Description,
            request.IsDefault);

        _db.TaskBoards.Add(board);
        await _db.SaveChangesAsync(cancellationToken);

        return board.Id;
    }
}
