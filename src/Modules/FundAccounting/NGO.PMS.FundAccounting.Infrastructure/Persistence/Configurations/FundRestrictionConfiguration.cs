using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class FundRestrictionConfiguration : IEntityTypeConfiguration<FundRestriction>
{
    public void Configure(EntityTypeBuilder<FundRestriction> builder)
    {
        builder.ToTable("fund_restrictions");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.OriginalAmount).HasPrecision(18, 2);
        builder.Property(e => e.ReleasedAmount).HasPrecision(18, 2);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.ConditionDescription).HasMaxLength(4000);

        // Computed property — not persisted
        builder.Ignore(e => e.RemainingAmount);

        // Foreign key
        builder.HasIndex(e => e.FundCodeId)
            .HasDatabaseName("ix_fund_restrictions_fund_code");
    }
}
