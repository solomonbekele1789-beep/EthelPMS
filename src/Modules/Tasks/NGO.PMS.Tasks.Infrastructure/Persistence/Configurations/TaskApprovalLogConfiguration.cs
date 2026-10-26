using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Tasks.Domain.Entities;

namespace NGO.PMS.Tasks.Infrastructure.Persistence.Configurations;

public class TaskApprovalLogConfiguration : IEntityTypeConfiguration<TaskApprovalLog>
{
    public void Configure(EntityTypeBuilder<TaskApprovalLog> builder)
    {
        builder.ToTable("task_approval_logs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ApproverName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Action)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Comments)
            .HasMaxLength(2000);

        builder.HasIndex(e => new { e.TaskItemId, e.ApprovalLevel })
            .HasDatabaseName("ix_task_approval_logs_task_level");
    }
}
