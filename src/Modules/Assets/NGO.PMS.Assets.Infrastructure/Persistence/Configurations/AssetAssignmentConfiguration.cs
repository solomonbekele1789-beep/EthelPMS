using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetAssignmentConfiguration : IEntityTypeConfiguration<AssetAssignment>
{
    public void Configure(EntityTypeBuilder<AssetAssignment> builder)
    {
        builder.ToTable("asset_assignments");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.AssignedToName)
            .HasMaxLength(200);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(e => e.AssetId)
            .HasDatabaseName("ix_asset_assignments_asset");

        builder.HasIndex(e => e.AssignedToUserId)
            .HasDatabaseName("ix_asset_assignments_user");
    }
}
