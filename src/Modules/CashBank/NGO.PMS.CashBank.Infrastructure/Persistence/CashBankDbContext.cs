using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.CashBank.Infrastructure.Persistence;

public class CashBankDbContext : MultiTenantDbContext, ICashBankDbContext
{
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<CashTransaction> CashTransactions => Set<CashTransaction>();
    public DbSet<PettyCashFund> PettyCashFunds => Set<PettyCashFund>();
    public DbSet<BankReconciliation> BankReconciliations => Set<BankReconciliation>();
    public DbSet<BankReconciliationItem> BankReconciliationItems => Set<BankReconciliationItem>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public CashBankDbContext(DbContextOptions<CashBankDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("cashbank");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CashBankDbContext).Assembly);
    }
}
