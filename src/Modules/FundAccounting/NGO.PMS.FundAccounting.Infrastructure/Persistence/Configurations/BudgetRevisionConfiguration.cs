using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class BudgetRevisionConfiguration : IEntityTypeConfiguration<BudgetRevision>
{
    public void Configure(EntityTypeBuilder<BudgetRevision> builder)
    {
        builder.ToTable("budget_revisions");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.RevisionType).HasConversion<string>().HasMaxLength(30);
        builder.Property(e => e.Justification).IsRequired().HasMaxLength(2000);
        builder.Property(e => e.PreviousTotal).HasPrecision(18, 2);
        builder.Property(e => e.NewTotal).HasPrecision(18, 2);

        // Indexes
        builder.HasIndex(e => e.BudgetId)
            .HasDatabaseName("ix_budget_revisions_budget");
    }
}
