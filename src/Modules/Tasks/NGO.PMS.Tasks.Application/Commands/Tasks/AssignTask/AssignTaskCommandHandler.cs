using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.AssignTask;

public sealed class AssignTaskCommandHandler : IRequestHandler<AssignTaskCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AssignTaskCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AssignTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException($"Task {request.TaskId} not found.");

        task.AssignTo(request.AssignedToUserId, request.AssignedToName);

        var assignment = TaskAssignment.Create(
            request.TaskId,
            request.AssignedToUserId,
            request.AssignedToName,
            _currentUser.UserId,
            _currentUser.OrganizationId,
            request.Role);

        _db.TaskAssignments.Add(assignment);
        await _db.SaveChangesAsync(cancellationToken);

        return assignment.Id;
    }
}
