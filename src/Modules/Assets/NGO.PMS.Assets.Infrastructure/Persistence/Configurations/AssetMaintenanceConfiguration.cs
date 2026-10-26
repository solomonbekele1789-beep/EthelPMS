using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetMaintenanceConfiguration : IEntityTypeConfiguration<AssetMaintenance>
{
    public void Configure(EntityTypeBuilder<AssetMaintenance> builder)
    {
        builder.ToTable("asset_maintenance");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Cost)
            .HasPrecision(18, 2);

        builder.Property(e => e.PerformedBy)
            .HasMaxLength(200);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(e => new { e.AssetId, e.ScheduledDate })
            .HasDatabaseName("ix_asset_maintenance_asset_scheduled");
    }
}
