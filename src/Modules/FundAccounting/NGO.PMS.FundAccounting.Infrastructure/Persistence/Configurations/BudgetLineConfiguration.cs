using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class BudgetLineConfiguration : IEntityTypeConfiguration<BudgetLine>
{
    public void Configure(EntityTypeBuilder<BudgetLine> builder)
    {
        builder.ToTable("budget_lines");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description).IsRequired().HasMaxLength(500);
        builder.Property(e => e.Q1Amount).HasPrecision(18, 2);
        builder.Property(e => e.Q2Amount).HasPrecision(18, 2);
        builder.Property(e => e.Q3Amount).HasPrecision(18, 2);
        builder.Property(e => e.Q4Amount).HasPrecision(18, 2);
        builder.Property(e => e.ActualAmount).HasPrecision(18, 2);

        // Computed properties — not persisted
        builder.Ignore(e => e.AnnualAmount);
        builder.Ignore(e => e.Variance);
        builder.Ignore(e => e.UtilizationRate);

        // Indexes
        builder.HasIndex(e => new { e.BudgetId, e.AccountId })
            .HasDatabaseName("ix_budget_lines_budget_account");
    }
}
