using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Infrastructure.Persistence.Configurations;

public class UserNotificationPreferenceConfiguration : IEntityTypeConfiguration<UserNotificationPreference>
{
    public void Configure(EntityTypeBuilder<UserNotificationPreference> builder)
    {
        builder.ToTable("user_notification_preferences");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.UserId)
            .IsRequired();

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(e => new { e.UserId, e.EventType })
            .IsUnique()
            .HasDatabaseName("uq_user_notification_preferences_user_event_type");
    }
}
