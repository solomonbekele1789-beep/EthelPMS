using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskStatus;

public sealed class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, Unit>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateTaskStatusCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException($"Task {request.TaskId} not found.");

        task.UpdateStatus(request.Status);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
