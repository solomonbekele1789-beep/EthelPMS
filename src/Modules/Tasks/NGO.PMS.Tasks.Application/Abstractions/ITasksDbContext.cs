using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Application.Abstractions;

public interface ITasksDbContext
{
    DbSet<TaskBoard> TaskBoards { get; }
    DbSet<TaskList> TaskLists { get; }
    DbSet<TaskItem> TaskItems { get; }
    DbSet<TaskAssignment> TaskAssignments { get; }
    DbSet<TaskComment> TaskComments { get; }
    DbSet<TaskApprovalLog> TaskApprovalLogs { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
