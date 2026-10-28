using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class FundCodeConfiguration : IEntityTypeConfiguration<FundCode>
{
    public void Configure(EntityTypeBuilder<FundCode> builder)
    {
        builder.ToTable("fund_codes");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.FundType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Description).HasMaxLength(2000);

        // Indexes
        builder.HasIndex(e => new { e.OrganizationId, e.Code })
            .IsUnique()
            .HasDatabaseName("uq_fund_codes_org_code");
    }
}
