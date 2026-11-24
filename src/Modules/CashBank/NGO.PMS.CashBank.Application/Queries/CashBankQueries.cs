using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.CashBank.Application.Abstractions;
using NGO.PMS.CashBank.Application.DTOs;
using NGO.PMS.CashBank.Domain.Enums;

namespace NGO.PMS.CashBank.Application.Queries;

public sealed record ListBankAccountsQuery(bool? IsActive = null, string? CurrencyCode = null)
    : IRequest<IReadOnlyList<BankAccountDto>>;

public sealed class ListBankAccountsQueryHandler : IRequestHandler<ListBankAccountsQuery, IReadOnlyList<BankAccountDto>>
{
    private readonly ICashBankDbContext _db;
    public ListBankAccountsQueryHandler(ICashBankDbContext db) => _db = db;

    public async Task<IReadOnlyList<BankAccountDto>> Handle(ListBankAccountsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.BankAccounts.AsNoTracking().AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(x => x.IsActive == request.IsActive.Value);
        if (!string.IsNullOrWhiteSpace(request.CurrencyCode))
            query = query.Where(x => x.CurrencyCode == request.CurrencyCode.ToUpperInvariant());

        return await query
            .OrderBy(x => x.AccountCode)
            .Select(x => new BankAccountDto(
                x.Id, x.AccountCode, x.AccountName, x.BankName, x.BranchName,
                x.AccountNumber, x.SwiftCode, x.CurrencyCode, x.AccountType,
                x.OpeningBalance, x.CurrentBalance, x.GlAccountId, x.FundCodeId,
                x.OfficeId, x.IsActive))
            .ToListAsync(cancellationToken);
    }
}

public sealed record ListCashTransactionsQuery(
    Guid? BankAccountId = null,
    CashTransactionStatus? Status = null,
    bool? IsReconciled = null) : IRequest<IReadOnlyList<CashTransactionDto>>;

public sealed class ListCashTransactionsQueryHandler : IRequestHandler<ListCashTransactionsQuery, IReadOnlyList<CashTransactionDto>>
{
    private readonly ICashBankDbContext _db;
    public ListCashTransactionsQueryHandler(ICashBankDbContext db) => _db = db;

    public async Task<IReadOnlyList<CashTransactionDto>> Handle(ListCashTransactionsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.CashTransactions.AsNoTracking().AsQueryable();

        if (request.BankAccountId.HasValue)
            query = query.Where(x => x.BankAccountId == request.BankAccountId.Value);
        if (request.Status.HasValue)
            query = query.Where(x => x.Status == request.Status.Value);
        if (request.IsReconciled.HasValue)
            query = query.Where(x => x.IsReconciled == request.IsReconciled.Value);

        var accounts = await _db.BankAccounts.AsNoTracking()
            .ToDictionaryAsync(a => a.Id, a => a.AccountName, cancellationToken);

        var items = await query
            .OrderByDescending(x => x.TransactionDate)
            .ThenByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        return items.Select(x => new CashTransactionDto(
            x.Id, x.VoucherNumber, x.BankAccountId,
            accounts.GetValueOrDefault(x.BankAccountId, string.Empty),
            x.TransactionDate, x.TransactionType, x.Amount, x.CurrencyCode,
            x.ExchangeRate, x.PayeeOrPayer, x.ReferenceNumber, x.Description,
            x.ProjectId, x.FundCodeId, x.PaymentRequestId, x.Status,
            x.IsReconciled, x.PostedAt)).ToList();
    }
}

public sealed record ListPettyCashFundsQuery(bool? IsActive = null) : IRequest<IReadOnlyList<PettyCashFundDto>>;

public sealed class ListPettyCashFundsQueryHandler : IRequestHandler<ListPettyCashFundsQuery, IReadOnlyList<PettyCashFundDto>>
{
    private readonly ICashBankDbContext _db;
    public ListPettyCashFundsQueryHandler(ICashBankDbContext db) => _db = db;

    public async Task<IReadOnlyList<PettyCashFundDto>> Handle(ListPettyCashFundsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.PettyCashFunds.AsNoTracking().AsQueryable();
        if (request.IsActive.HasValue)
            query = query.Where(x => x.IsActive == request.IsActive.Value);

        var funds = await query.OrderBy(x => x.Code).ToListAsync(cancellationToken);
        return funds.Select(x => new PettyCashFundDto(
            x.Id, x.Code, x.Name, x.CustodianUserId, x.OfficeId, x.BankAccountId,
            x.CurrencyCode, x.ImprestLimit, x.CurrentBalance, x.ReplenishmentThreshold,
            x.NeedsReplenishment, x.IsActive)).ToList();
    }
}

public sealed record ListBankReconciliationsQuery(Guid? BankAccountId = null) : IRequest<IReadOnlyList<BankReconciliationDto>>;

public sealed class ListBankReconciliationsQueryHandler : IRequestHandler<ListBankReconciliationsQuery, IReadOnlyList<BankReconciliationDto>>
{
    private readonly ICashBankDbContext _db;
    public ListBankReconciliationsQueryHandler(ICashBankDbContext db) => _db = db;

    public async Task<IReadOnlyList<BankReconciliationDto>> Handle(ListBankReconciliationsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.BankReconciliations.AsNoTracking().AsQueryable();
        if (request.BankAccountId.HasValue)
            query = query.Where(x => x.BankAccountId == request.BankAccountId.Value);

        var accounts = await _db.BankAccounts.AsNoTracking()
            .ToDictionaryAsync(a => a.Id, a => a.AccountName, cancellationToken);

        var items = await query.OrderByDescending(x => x.StatementDate).ToListAsync(cancellationToken);
        return items.Select(x => new BankReconciliationDto(
            x.Id, x.BankAccountId,
            accounts.GetValueOrDefault(x.BankAccountId, string.Empty),
            x.StatementDate, x.PeriodStart, x.PeriodEnd,
            x.StatementEndingBalance, x.BookEndingBalance, x.Difference,
            x.Status, x.Notes, x.CompletedAt)).ToList();
    }
}

public sealed record GetCashBankSummaryQuery() : IRequest<CashBankSummaryDto>;

public sealed class GetCashBankSummaryQueryHandler : IRequestHandler<GetCashBankSummaryQuery, CashBankSummaryDto>
{
    private readonly ICashBankDbContext _db;
    public GetCashBankSummaryQueryHandler(ICashBankDbContext db) => _db = db;

    public async Task<CashBankSummaryDto> Handle(GetCashBankSummaryQuery request, CancellationToken cancellationToken)
    {
        var activeAccounts = await _db.BankAccounts.AsNoTracking().Where(x => x.IsActive).ToListAsync(cancellationToken);
        var activePettyCash = await _db.PettyCashFunds.AsNoTracking().CountAsync(x => x.IsActive, cancellationToken);
        var pendingVouchers = await _db.CashTransactions.AsNoTracking()
            .CountAsync(x => x.Status == CashTransactionStatus.Draft || x.Status == CashTransactionStatus.PendingApproval, cancellationToken);
        var unreconciled = await _db.CashTransactions.AsNoTracking()
            .CountAsync(x => x.Status == CashTransactionStatus.Posted && !x.IsReconciled, cancellationToken);

        var byCurrency = activeAccounts
            .GroupBy(x => x.CurrencyCode)
            .Select(g => new CurrencyBalanceDto(g.Key, g.Sum(a => a.CurrentBalance), g.Count()))
            .OrderBy(c => c.CurrencyCode)
            .ToList();

        return new CashBankSummaryDto(
            activeAccounts.Count,
            activePettyCash,
            pendingVouchers,
            unreconciled,
            byCurrency);
    }
}
