using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Feedback.Domain.Entities;

namespace NGO.PMS.Feedback.Infrastructure.Persistence.Configurations;

public class FeedbackItemConfiguration : IEntityTypeConfiguration<FeedbackItem>
{
    public void Configure(EntityTypeBuilder<FeedbackItem> builder)
    {
        builder.ToTable("feedback_items");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ReferenceNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(e => e.SubmitterName)
            .HasMaxLength(200);

        builder.Property(e => e.SubmitterContact)
            .HasMaxLength(200);

        builder.Property(e => e.Location)
            .HasMaxLength(500);

        builder.Property(e => e.AssignedToName)
            .HasMaxLength(200);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.Property(e => e.Type).IsRequired();
        builder.Property(e => e.Status).IsRequired();
        builder.Property(e => e.Priority).IsRequired();
        builder.Property(e => e.Channel).IsRequired();

        builder.HasMany(e => e.Responses)
            .WithOne()
            .HasForeignKey(e => e.FeedbackItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => e.ReferenceNumber)
            .IsUnique()
            .HasDatabaseName("ix_feedback_items_reference_number");

        builder.HasIndex(e => new { e.Status, e.Type })
            .HasDatabaseName("ix_feedback_items_status_type");

        builder.HasIndex(e => e.ProjectId)
            .HasDatabaseName("ix_feedback_items_project_id");

        builder.HasIndex(e => e.AssignedToUserId)
            .HasDatabaseName("ix_feedback_items_assigned_to");
    }
}
