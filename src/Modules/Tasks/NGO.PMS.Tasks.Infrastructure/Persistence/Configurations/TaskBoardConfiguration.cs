using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence.Configurations;

public class TaskBoardConfiguration : IEntityTypeConfiguration<TaskBoard>
{
    public void Configure(EntityTypeBuilder<TaskBoard> builder)
    {
        builder.ToTable("task_boards");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.HasMany(e => e.Lists)
            .WithOne()
            .HasForeignKey(e => e.TaskBoardId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.OrganizationId, e.ProjectId })
            .HasDatabaseName("ix_task_boards_org_project");
    }
}
