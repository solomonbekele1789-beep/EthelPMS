using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;
using NGO.PMS.Tasks.Application.Abstractions;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence;

public class TasksDbContext : MultiTenantDbContext, ITasksDbContext
{
    public DbSet<TaskBoard> TaskBoards => Set<TaskBoard>();
    public DbSet<TaskList> TaskLists => Set<TaskList>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TaskApprovalLog> TaskApprovalLogs => Set<TaskApprovalLog>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public TasksDbContext(DbContextOptions<TasksDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("tasks");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TasksDbContext).Assembly);
    }
}
