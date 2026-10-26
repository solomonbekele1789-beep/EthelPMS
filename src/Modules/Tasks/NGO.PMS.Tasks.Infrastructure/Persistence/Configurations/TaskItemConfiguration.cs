using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("tasks");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.Description)
            .HasMaxLength(4000);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.AssignedToName)
            .HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany(e => e.Assignments)
            .WithOne()
            .HasForeignKey(e => e.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Comments)
            .WithOne()
            .HasForeignKey(e => e.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.ApprovalLogs)
            .WithOne()
            .HasForeignKey(e => e.TaskItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<TaskItem>()
            .WithMany()
            .HasForeignKey(e => e.ParentTaskId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        builder.HasIndex(e => new { e.TaskListId, e.SortOrder })
            .HasDatabaseName("ix_tasks_list_sort");
    }
}
