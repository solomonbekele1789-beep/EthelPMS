using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NGO.PMS.CashBank.Domain.Entities;

namespace NGO.PMS.CashBank.Infrastructure.Persistence.Configurations;

public sealed class BankAccountConfiguration : IEntityTypeConfiguration<BankAccount>
{
    public void Configure(EntityTypeBuilder<BankAccount> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.AccountCode).IsRequired().HasMaxLength(50);
        builder.Property(x => x.AccountName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.BankName).IsRequired().HasMaxLength(200);
        builder.Property(x => x.BranchName).HasMaxLength(200);
        builder.Property(x => x.AccountNumber).IsRequired().HasMaxLength(100);
        builder.Property(x => x.SwiftCode).HasMaxLength(30);
        builder.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
        builder.Property(x => x.OpeningBalance).HasPrecision(18, 2);
        builder.Property(x => x.CurrentBalance).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.OrganizationId, x.AccountCode }).IsUnique();
    }
}

public sealed class CashTransactionConfiguration : IEntityTypeConfiguration<CashTransaction>
{
    public void Configure(EntityTypeBuilder<CashTransaction> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.VoucherNumber).IsRequired().HasMaxLength(60);
        builder.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.ExchangeRate).HasPrecision(18, 6);
        builder.Property(x => x.PayeeOrPayer).IsRequired().HasMaxLength(200);
        builder.Property(x => x.ReferenceNumber).HasMaxLength(100);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.HasIndex(x => new { x.OrganizationId, x.VoucherNumber }).IsUnique();
        builder.HasIndex(x => new { x.BankAccountId, x.TransactionDate });
    }
}

public sealed class PettyCashFundConfiguration : IEntityTypeConfiguration<PettyCashFund>
{
    public void Configure(EntityTypeBuilder<PettyCashFund> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Code).IsRequired().HasMaxLength(50);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.CurrencyCode).IsRequired().HasMaxLength(3);
        builder.Property(x => x.ImprestLimit).HasPrecision(18, 2);
        builder.Property(x => x.CurrentBalance).HasPrecision(18, 2);
        builder.Property(x => x.ReplenishmentThreshold).HasPrecision(18, 2);
        builder.HasIndex(x => new { x.OrganizationId, x.Code }).IsUnique();
    }
}

public sealed class BankReconciliationConfiguration : IEntityTypeConfiguration<BankReconciliation>
{
    public void Configure(EntityTypeBuilder<BankReconciliation> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.StatementEndingBalance).HasPrecision(18, 2);
        builder.Property(x => x.BookEndingBalance).HasPrecision(18, 2);
        builder.Property(x => x.Difference).HasPrecision(18, 2);
        builder.Property(x => x.Notes).HasMaxLength(1000);
        builder.HasMany(x => x.Items).WithOne().HasForeignKey(i => i.BankReconciliationId).OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(x => new { x.BankAccountId, x.StatementDate });
    }
}

public sealed class BankReconciliationItemConfiguration : IEntityTypeConfiguration<BankReconciliationItem>
{
    public void Configure(EntityTypeBuilder<BankReconciliationItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
        builder.Property(x => x.Amount).HasPrecision(18, 2);
        builder.Property(x => x.StatementReference).HasMaxLength(100);
        builder.HasIndex(x => x.BankReconciliationId);
    }
}
