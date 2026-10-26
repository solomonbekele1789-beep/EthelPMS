using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetTransferConfiguration : IEntityTypeConfiguration<AssetTransfer>
{
    public void Configure(EntityTypeBuilder<AssetTransfer> builder)
    {
        builder.ToTable("asset_transfers");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FromLocation)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.ToLocation)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Reason)
            .HasMaxLength(500);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => e.AssetId)
            .HasDatabaseName("ix_asset_transfers_asset");
    }
}
