using Microsoft.EntityFrameworkCore;
using NGO.PMS.FundAccounting.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.FundAccounting.Application.Abstractions;

public interface IFundAccountingDbContext
{
    DbSet<AccountCategory> AccountCategories { get; }
    DbSet<ChartOfAccount> ChartOfAccounts { get; }
    DbSet<FundCode> FundCodes { get; }
    DbSet<FundRestriction> FundRestrictions { get; }
    DbSet<JournalEntry> JournalEntries { get; }
    DbSet<JournalLine> JournalLines { get; }
    DbSet<Budget> Budgets { get; }
    DbSet<BudgetLine> BudgetLines { get; }
    DbSet<BudgetRevision> BudgetRevisions { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
