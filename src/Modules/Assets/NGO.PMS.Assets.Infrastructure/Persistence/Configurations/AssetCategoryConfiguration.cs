using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetCategoryConfiguration : IEntityTypeConfiguration<AssetCategory>
{
    public void Configure(EntityTypeBuilder<AssetCategory> builder)
    {
        builder.ToTable("asset_categories");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.DefaultDepreciationMethod)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.DefaultUsefulLifeYears)
            .HasPrecision(5, 2);

        builder.Property(e => e.DefaultResidualValuePercent)
            .HasPrecision(5, 2);

        builder.HasIndex(e => new { e.OrganizationId, e.Code })
            .IsUnique()
            .HasDatabaseName("uq_asset_categories_org_code");
    }
}
