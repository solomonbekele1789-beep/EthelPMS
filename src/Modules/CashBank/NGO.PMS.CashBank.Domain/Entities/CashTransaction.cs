using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Domain.Entities;

public class CashTransaction : AuditableEntity
{
    public string VoucherNumber { get; private set; } = null!;
    public Guid BankAccountId { get; private set; }
    public DateTime TransactionDate { get; private set; }
    public CashTransactionType TransactionType { get; private set; }
    public decimal Amount { get; private set; }
    public string CurrencyCode { get; private set; } = "ETB";
    public decimal ExchangeRate { get; private set; } = 1m;
    public string PayeeOrPayer { get; private set; } = null!;
    public string? ReferenceNumber { get; private set; }
    public string Description { get; private set; } = null!;
    public Guid? ProjectId { get; private set; }
    public Guid? FundCodeId { get; private set; }
    public Guid? PaymentRequestId { get; private set; }
    public CashTransactionStatus Status { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public DateTime? PostedAt { get; private set; }
    public bool IsReconciled { get; private set; }
    public Guid? ReconciliationId { get; private set; }
    public Guid OrganizationId { get; set; }

    private CashTransaction() { }

    public static CashTransaction Create(
        string voucherNumber,
        Guid bankAccountId,
        DateTime transactionDate,
        CashTransactionType transactionType,
        decimal amount,
        string currencyCode,
        decimal exchangeRate,
        string payeeOrPayer,
        string description,
        Guid organizationId,
        string? referenceNumber = null,
        Guid? projectId = null,
        Guid? fundCodeId = null,
        Guid? paymentRequestId = null)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Transaction amount must be positive.");
        if (exchangeRate <= 0)
            throw new ArgumentOutOfRangeException(nameof(exchangeRate), "Exchange rate must be positive.");

        return new CashTransaction
        {
            VoucherNumber = voucherNumber.Trim(),
            BankAccountId = bankAccountId,
            TransactionDate = DateTime.SpecifyKind(transactionDate, DateTimeKind.Utc),
            TransactionType = transactionType,
            Amount = amount,
            CurrencyCode = string.IsNullOrWhiteSpace(currencyCode) ? "ETB" : currencyCode.Trim().ToUpperInvariant(),
            ExchangeRate = exchangeRate,
            PayeeOrPayer = payeeOrPayer.Trim(),
            ReferenceNumber = referenceNumber?.Trim(),
            Description = description.Trim(),
            ProjectId = projectId,
            FundCodeId = fundCodeId,
            PaymentRequestId = paymentRequestId,
            Status = CashTransactionStatus.Draft,
            IsReconciled = false,
            OrganizationId = organizationId
        };
    }

    public decimal GetSignedBalanceDelta() => TransactionType switch
    {
        CashTransactionType.Receipt or CashTransactionType.TransferIn or CashTransactionType.Interest => Amount,
        CashTransactionType.Payment or CashTransactionType.TransferOut or CashTransactionType.BankCharge => -Amount,
        _ => throw new InvalidOperationException($"Unsupported transaction type: {TransactionType}")
    };

    public void SubmitForApproval()
    {
        if (Status != CashTransactionStatus.Draft)
            throw new InvalidOperationException("Only draft vouchers can be submitted for approval.");
        Status = CashTransactionStatus.PendingApproval;
    }

    public void Approve(Guid approverUserId)
    {
        if (Status is not (CashTransactionStatus.Draft or CashTransactionStatus.PendingApproval))
            throw new InvalidOperationException("Only draft or pending vouchers can be approved.");
        Status = CashTransactionStatus.Approved;
        ApprovedBy = approverUserId;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Post()
    {
        if (Status != CashTransactionStatus.Approved)
            throw new InvalidOperationException("Voucher must be approved before posting.");
        Status = CashTransactionStatus.Posted;
        PostedAt = DateTime.UtcNow;
    }

    public void Void()
    {
        if (IsReconciled)
            throw new InvalidOperationException("Reconciled transactions cannot be voided.");
        if (Status == CashTransactionStatus.Voided)
            throw new InvalidOperationException("Transaction is already voided.");
        Status = CashTransactionStatus.Voided;
    }

    public void MarkReconciled(Guid reconciliationId)
    {
        if (Status != CashTransactionStatus.Posted)
            throw new InvalidOperationException("Only posted transactions can be reconciled.");
        IsReconciled = true;
        ReconciliationId = reconciliationId;
    }
}
