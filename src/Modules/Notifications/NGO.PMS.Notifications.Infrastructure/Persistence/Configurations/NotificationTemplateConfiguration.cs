using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Infrastructure.Persistence.Configurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("notification_templates");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EventType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.TitleTemplateEn)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(e => e.BodyTemplateEn)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(e => e.TitleTemplateAm)
            .HasMaxLength(300);

        builder.Property(e => e.BodyTemplateAm)
            .HasMaxLength(2000);

        builder.Property(e => e.DefaultChannel)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.TenantId)
            .IsRequired()
            .HasMaxLength(64);

        builder.HasIndex(e => new { e.TenantId, e.EventType })
            .IsUnique()
            .HasDatabaseName("uq_notification_templates_tenant_event_type");
    }
}
