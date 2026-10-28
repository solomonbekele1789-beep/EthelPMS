using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("assets");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.AssetCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.SerialNumber)
            .HasMaxLength(100);

        builder.Property(e => e.ModelNumber)
            .HasMaxLength(100);

        builder.Property(e => e.Location)
            .HasMaxLength(200);

        builder.Property(e => e.PurchaseCost)
            .HasPrecision(18, 2);

        builder.Property(e => e.CurrentBookValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.AnnualDepreciation)
            .HasPrecision(18, 2);

        builder.Property(e => e.AccumulatedDepreciation)
            .HasPrecision(18, 2);

        builder.Property(e => e.ResidualValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.UsefulLifeYears)
            .HasPrecision(5, 2);

        builder.Property(e => e.DepreciationMethod)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Condition)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.AssignedToName)
            .HasMaxLength(200);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.Property(e => e.DeletedBy)
            .HasMaxLength(200);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.HasMany<AssetAssignment>()
            .WithOne()
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany<AssetTransfer>()
            .WithOne()
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany<AssetDisposal>()
            .WithOne()
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany<AssetMaintenance>()
            .WithOne()
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.OrganizationId, e.AssetCode })
            .IsUnique()
            .HasDatabaseName("uq_assets_org_code");

        builder.HasIndex(e => e.AssetCategoryId)
            .HasDatabaseName("ix_assets_category");
    }
}
