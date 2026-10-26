using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Application.Abstractions;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Outbox;
using NGO.PMS.SharedKernel.Persistence;

namespace NGO.PMS.FundAccounting.Infrastructure.Persistence;

public class FundAccountingDbContext : MultiTenantDbContext, IFundAccountingDbContext
{
    public DbSet<AccountCategory> AccountCategories => Set<AccountCategory>();
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>();
    public DbSet<FundCode> FundCodes => Set<FundCode>();
    public DbSet<FundRestriction> FundRestrictions => Set<FundRestriction>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalLine> JournalLines => Set<JournalLine>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<BudgetLine> BudgetLines => Set<BudgetLine>();
    public DbSet<BudgetRevision> BudgetRevisions => Set<BudgetRevision>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public FundAccountingDbContext(DbContextOptions<FundAccountingDbContext> options, ICurrentUserService currentUser)
        : base(options, currentUser) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("fundacct");
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(FundAccountingDbContext).Assembly);
    }
}
