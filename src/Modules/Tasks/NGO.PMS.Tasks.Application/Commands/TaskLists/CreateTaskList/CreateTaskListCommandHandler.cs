using MediatR;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Commands.TaskLists.CreateTaskList;

public sealed class CreateTaskListCommandHandler : IRequestHandler<CreateTaskListCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTaskListCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateTaskListCommand request, CancellationToken cancellationToken)
    {
        var list = TaskList.Create(
            request.TaskBoardId,
            request.Name,
            request.SortOrder,
            _currentUser.OrganizationId,
            request.Color);

        _db.TaskLists.Add(list);
        await _db.SaveChangesAsync(cancellationToken);

        return list.Id;
    }
}
