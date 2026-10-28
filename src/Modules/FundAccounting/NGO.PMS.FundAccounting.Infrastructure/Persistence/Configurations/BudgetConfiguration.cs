using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.FundAccounting.Domain.Entities;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("budgets");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Title).IsRequired().HasMaxLength(200);
        builder.Property(e => e.CurrencyCode).IsRequired().HasMaxLength(3);
        builder.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(e => e.ExchangeRate).HasPrecision(18, 6);
        builder.Property(e => e.RejectionReason).HasMaxLength(2000);

        // Computed property — not persisted
        builder.Ignore(e => e.TotalAmount);

        // Relationships
        builder.HasMany(e => e.Lines)
            .WithOne()
            .HasForeignKey(l => l.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Revisions)
            .WithOne()
            .HasForeignKey(r => r.BudgetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(e => new { e.OrganizationId, e.ProjectId, e.FiscalYear })
            .HasDatabaseName("ix_budgets_org_project_year");
    }
}
