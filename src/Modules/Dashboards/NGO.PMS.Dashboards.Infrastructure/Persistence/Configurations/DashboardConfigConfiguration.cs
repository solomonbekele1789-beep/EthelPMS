using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.Dashboards.Domain.Enums;

namespace NGO.PMS.Dashboards.Infrastructure.Persistence.Configurations;

public class DashboardConfigConfiguration : IEntityTypeConfiguration<DashboardConfig>
{
    public void Configure(EntityTypeBuilder<DashboardConfig> builder)
    {
        builder.ToTable("dashboard_configs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.DashboardType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.LayoutJson)
            .HasColumnType("text");

        // ISoftDeletable
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy).HasMaxLength(256);

        builder.HasIndex(e => e.OrganizationId)
            .HasDatabaseName("ix_dashboard_configs_organization");

        builder.HasIndex(e => e.OwnerId)
            .HasDatabaseName("ix_dashboard_configs_owner");

        builder.HasMany(e => e.Widgets)
            .WithOne(w => w.DashboardConfig)
            .HasForeignKey(w => w.DashboardConfigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
