using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Infrastructure.Persistence.Configurations;

public class AlertThresholdConfiguration : IEntityTypeConfiguration<AlertThreshold>
{
    public void Configure(EntityTypeBuilder<AlertThreshold> builder)
    {
        builder.ToTable("alert_thresholds");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Module)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.MetricName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ThresholdValue)
            .HasPrecision(18, 4);

        builder.Property(e => e.Operator)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.AlertSeverity)
            .HasConversion<string>()
            .HasMaxLength(20);

        // ISoftDeletable
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy).HasMaxLength(256);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_alert_thresholds_organization");

        builder.HasIndex(e => new { e.OrganizationId, e.Module })
            .HasDatabaseName("ix_alert_thresholds_org_module");

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
