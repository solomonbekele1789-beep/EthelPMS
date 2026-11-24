using NGO.PMS.CashBank.Domain.Enums;

namespace NGO.PMS.CashBank.Application.DTOs;

public sealed record BankAccountDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    string BankName,
    string? BranchName,
    string AccountNumber,
    string? SwiftCode,
    string CurrencyCode,
    BankAccountType AccountType,
    decimal OpeningBalance,
    decimal CurrentBalance,
    Guid? GlAccountId,
    Guid? FundCodeId,
    Guid? OfficeId,
    bool IsActive);

public sealed record CashTransactionDto(
    Guid Id,
    string VoucherNumber,
    Guid BankAccountId,
    string BankAccountName,
    DateTime TransactionDate,
    CashTransactionType TransactionType,
    decimal Amount,
    string CurrencyCode,
    decimal ExchangeRate,
    string PayeeOrPayer,
    string? ReferenceNumber,
    string Description,
    Guid? ProjectId,
    Guid? FundCodeId,
    Guid? PaymentRequestId,
    CashTransactionStatus Status,
    bool IsReconciled,
    DateTime? PostedAt);

public sealed record PettyCashFundDto(
    Guid Id,
    string Code,
    string Name,
    Guid CustodianUserId,
    Guid? OfficeId,
    Guid BankAccountId,
    string CurrencyCode,
    decimal ImprestLimit,
    decimal CurrentBalance,
    decimal ReplenishmentThreshold,
    bool NeedsReplenishment,
    bool IsActive);

public sealed record BankReconciliationDto(
    Guid Id,
    Guid BankAccountId,
    string BankAccountName,
    DateTime StatementDate,
    DateTime PeriodStart,
    DateTime PeriodEnd,
    decimal StatementEndingBalance,
    decimal BookEndingBalance,
    decimal Difference,
    ReconciliationStatus Status,
    string? Notes,
    DateTime? CompletedAt);

public sealed record CurrencyBalanceDto(
    string CurrencyCode,
    decimal TotalBalance,
    int AccountCount);

public sealed record CashBankSummaryDto(
    int ActiveBankAccounts,
    int ActivePettyCashFunds,
    int PendingVouchers,
    int UnreconciledTransactions,
    IReadOnlyList<CurrencyBalanceDto> BalancesByCurrency);
