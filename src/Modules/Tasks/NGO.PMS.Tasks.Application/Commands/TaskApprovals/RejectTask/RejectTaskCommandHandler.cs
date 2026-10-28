using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;
using NGO.PMS.Tasks.Domain.Enums;

namespace NGO.PMS.Tasks.Application.Commands.TaskApprovals.RejectTask;

public sealed class RejectTaskCommandHandler : IRequestHandler<RejectTaskCommand, Guid>
{
    private readonly ITasksDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RejectTaskCommandHandler(ITasksDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(RejectTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _db.TaskItems.FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken)
            ?? throw new InvalidOperationException($"Task {request.TaskId} not found.");

        task.UpdateStatus(TaskItemStatus.Rejected);

        var log = TaskApprovalLog.Create(
            request.TaskId,
            _currentUser.UserId,
            _currentUser.FullName,
            ApprovalAction.Rejected,
            request.ApprovalLevel,
            _currentUser.OrganizationId,
            request.Comments);

        _db.TaskApprovalLogs.Add(log);
        await _db.SaveChangesAsync(cancellationToken);

        return log.Id;
    }
}
