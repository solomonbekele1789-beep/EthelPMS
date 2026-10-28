using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Feedback.Domain.Entities;

namespace NGO.PMS.Feedback.Infrastructure.Persistence.Configurations;

public class FeedbackCategoryConfiguration : IEntityTypeConfiguration<FeedbackCategory>
{
    public void Configure(EntityTypeBuilder<FeedbackCategory> builder)
    {
        builder.ToTable("feedback_categories");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.DefaultType)
            .IsRequired();

        builder.Property(e => e.SlaResponseDays)
            .IsRequired()
            .HasDefaultValue(5);

        builder.Property(e => e.SlaResolutionDays)
            .IsRequired()
            .HasDefaultValue(30);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(e => new { e.TenantId, e.Name })
            .IsUnique()
            .HasDatabaseName("ix_feedback_categories_tenant_name");
    }
}
