using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class AccountCategoryConfiguration : IEntityTypeConfiguration<AccountCategory>
{
    public void Configure(EntityTypeBuilder<AccountCategory> builder)
    {
        builder.ToTable("account_categories");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code).IsRequired().HasMaxLength(20);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
        builder.Property(e => e.AccountType).HasConversion<string>().HasMaxLength(30);

        // Self-referencing hierarchy
        builder.HasOne(e => e.ParentCategory)
            .WithMany(e => e.SubCategories)
            .HasForeignKey(e => e.ParentCategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Accounts)
            .WithOne()
            .HasForeignKey(a => a.AccountCategoryId);

        // Indexes
        builder.HasIndex(e => new { e.OrganizationId, e.Code })
            .IsUnique()
            .HasDatabaseName("uq_account_categories_org_code");
    }
}
