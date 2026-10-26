using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class ChartOfAccountConfiguration : IEntityTypeConfiguration<ChartOfAccount>
{
    public void Configure(EntityTypeBuilder<ChartOfAccount> builder)
    {
        builder.ToTable("chart_of_accounts");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.AccountCode).IsRequired().HasMaxLength(20);
        builder.Property(e => e.AccountName).IsRequired().HasMaxLength(200);
        builder.Property(e => e.AccountType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Description).HasMaxLength(2000);
        builder.Property(e => e.DeletedBy).HasMaxLength(200);

        // Soft-delete query filter
        builder.HasQueryFilter(e => !e.IsDeleted);

        // Indexes
        builder.HasIndex(e => new { e.OrganizationId, e.AccountCode })
            .IsUnique()
            .HasDatabaseName("uq_chart_of_accounts_org_code");

        builder.HasIndex(e => e.AccountCategoryId);
    }
}
