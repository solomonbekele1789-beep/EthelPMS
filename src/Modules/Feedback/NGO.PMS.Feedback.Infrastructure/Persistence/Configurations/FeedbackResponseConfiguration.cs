using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Feedback.Domain.Entities;

namespace NGO.PMS.Feedback.Infrastructure.Persistence.Configurations;

public class FeedbackResponseConfiguration : IEntityTypeConfiguration<FeedbackResponse>
{
    public void Configure(EntityTypeBuilder<FeedbackResponse> builder)
    {
        builder.ToTable("feedback_responses");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Content)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(e => e.ResponderName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(e => e.FeedbackItemId)
            .HasDatabaseName("ix_feedback_responses_feedback_item_id");
    }
}
