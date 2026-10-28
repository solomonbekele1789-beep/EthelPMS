using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;

namespace NGO.PMS.Tasks.Application.Commands.Tasks.UpdateTaskProgress;

public sealed class UpdateTaskProgressCommandHandler : IRequestHandler<UpdateTaskProgressCommand, Unit>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateTaskProgressCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateTaskProgressCommand request, CancellationToken cancellationToken)
    {
        var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException($"Task {request.TaskId} not found.");

        task.UpdateProgress(request.ProgressPercentage);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
