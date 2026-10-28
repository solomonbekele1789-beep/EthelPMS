using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RecipientUserId)
            .IsRequired();

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.Body)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Channel)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.ActionUrl)
            .HasMaxLength(500);

        builder.Property(e => e.EntityId)
            .HasMaxLength(100);

        builder.Property(e => e.EntityType)
            .HasMaxLength(100);

        builder.Property(e => e.FailureReason)
            .HasMaxLength(1000);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(e => new { e.RecipientUserId, e.Status })
            .HasDatabaseName("ix_notifications_recipient_status");

        builder.HasIndex(e => new { e.RecipientUserId, e.CreatedAt })
            .IsDescending(false, true)
            .HasDatabaseName("ix_notifications_recipient_created_at");
    }
}
