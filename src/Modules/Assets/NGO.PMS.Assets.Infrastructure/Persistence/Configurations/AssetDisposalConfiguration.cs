using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.Assets.Domain.Entities;

namespace NGO.PMS.Assets.Infrastructure.Persistence.Configurations;

public class AssetDisposalConfiguration : IEntityTypeConfiguration<AssetDisposal>
{
    public void Configure(EntityTypeBuilder<AssetDisposal> builder)
    {
        builder.ToTable("asset_disposals");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Reason)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.DisposalMethod)
            .HasMaxLength(100);

        builder.Property(e => e.DisposalValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.BookValueAtDisposal)
            .HasPrecision(18, 2);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.DonorApprovalReference)
            .HasMaxLength(200);

        builder.HasIndex(e => e.AssetId)
            .HasDatabaseName("ix_asset_disposals_asset");
    }
}
