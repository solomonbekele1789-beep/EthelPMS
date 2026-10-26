using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence.Configurations;

public class TaskAssignmentConfiguration : IEntityTypeConfiguration<TaskAssignment>
{
    public void Configure(EntityTypeBuilder<TaskAssignment> builder)
    {
        builder.ToTable("task_assignments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.AssignedToName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Role)
            .HasMaxLength(50);

        builder.HasIndex(e => new { e.TaskItemId, e.AssignedToUserId })
            .HasDatabaseName("ix_task_assignments_task_user");
    }
}
