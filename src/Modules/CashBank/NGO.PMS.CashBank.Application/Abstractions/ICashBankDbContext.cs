using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.CashBank.Application.Abstractions;

public interface ICashBankDbContext
{
    DbSet<BankAccount> BankAccounts { get; }
    DbSet<CashTransaction> CashTransactions { get; }
    DbSet<PettyCashFund> PettyCashFunds { get; }
    DbSet<BankReconciliation> BankReconciliations { get; }
    DbSet<BankReconciliationItem> BankReconciliationItems { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
