using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence.Configurations;

public class TaskListConfiguration : IEntityTypeConfiguration<TaskList>
{
    public void Configure(EntityTypeBuilder<TaskList> builder)
    {
        builder.ToTable("task_lists");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Color)
            .HasMaxLength(20);

        builder.HasMany(e => e.Tasks)
            .WithOne()
            .HasForeignKey(e => e.TaskListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.TaskBoardId, e.SortOrder })
            .HasDatabaseName("ix_task_lists_board_sort");
    }
}
