using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Domain.Entities;

public class BankReconciliation : AuditableEntity
{
    public Guid BankAccountId { get; private set; }
    public DateTime StatementDate { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public decimal StatementEndingBalance { get; private set; }
    public decimal BookEndingBalance { get; private set; }
    public decimal Difference { get; private set; }
    public ReconciliationStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovedAt { get; private set; }
    public Guid OrganizationId { get; set; }

    private readonly List<BankReconciliationItem> _items = new();
    public IReadOnlyCollection<BankReconciliationItem> Items => _items.AsReadOnly();

    private BankReconciliation() { }

    public static BankReconciliation Create(
        Guid bankAccountId,
        DateTime statementDate,
        DateTime periodStart,
        DateTime periodEnd,
        decimal statementEndingBalance,
        decimal bookEndingBalance,
        Guid organizationId,
        string? notes = null)
    {
        if (periodEnd < periodStart)
            throw new ArgumentException("Period end cannot precede period start.", nameof(periodEnd));

        return new BankReconciliation
        {
            BankAccountId = bankAccountId,
            StatementDate = DateTime.SpecifyKind(statementDate, DateTimeKind.Utc),
            PeriodStart = DateTime.SpecifyKind(periodStart, DateTimeKind.Utc),
            PeriodEnd = DateTime.SpecifyKind(periodEnd, DateTimeKind.Utc),
            StatementEndingBalance = statementEndingBalance,
            BookEndingBalance = bookEndingBalance,
            Difference = statementEndingBalance - bookEndingBalance,
            Status = ReconciliationStatus.InProgress,
            Notes = notes?.Trim(),
            OrganizationId = organizationId
        };
    }

    public void UpdateBalances(decimal statementEndingBalance, decimal bookEndingBalance, string? notes = null)
    {
        if (Status == ReconciliationStatus.Approved)
            throw new InvalidOperationException("Approved reconciliations cannot be modified.");
        StatementEndingBalance = statementEndingBalance;
        BookEndingBalance = bookEndingBalance;
        Difference = statementEndingBalance - bookEndingBalance;
        if (notes is not null)
            Notes = notes.Trim();
    }

    public void Complete(string? notes = null)
    {
        if (Status != ReconciliationStatus.InProgress)
            throw new InvalidOperationException("Only in-progress reconciliations can be completed.");
        if (Difference != 0m)
            throw new InvalidOperationException($"Cannot complete reconciliation with non-zero difference ({Difference:N2}).");
        if (notes is not null)
            Notes = notes.Trim();
        Status = ReconciliationStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Approve(Guid approverUserId)
    {
        if (Status != ReconciliationStatus.Completed)
            throw new InvalidOperationException("Reconciliation must be completed before approval.");
        Status = ReconciliationStatus.Approved;
        ApprovedBy = approverUserId;
        ApprovedAt = DateTime.UtcNow;
    }
}
