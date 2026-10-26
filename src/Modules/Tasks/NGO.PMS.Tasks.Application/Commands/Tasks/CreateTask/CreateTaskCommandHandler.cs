using MediatR;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.CreateTask;

public sealed class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateTaskCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = TaskItem.Create(
            request.TaskListId,
            request.Title,
            _currentUser.OrganizationId,
            request.ProjectId,
            request.Description,
            request.Priority,
            request.DueDate,
            request.AssignedToUserId,
            request.AssignedToName,
            request.ParentTaskId,
            request.SortOrder);

        _db.TaskItems.Add(task);
        await _db.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}
