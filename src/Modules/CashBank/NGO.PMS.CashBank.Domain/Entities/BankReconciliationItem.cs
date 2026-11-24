using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Domain.Entities;

public class BankReconciliationItem : AuditableEntity
{
    public Guid BankReconciliationId { get; private set; }
    public Guid CashTransactionId { get; private set; }
    public DateTime ItemDate { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal Amount { get; private set; }
    public bool IsCleared { get; private set; }
    public string? StatementReference { get; private set; }
    public Guid OrganizationId { get; set; }

    private BankReconciliationItem() { }

    public static BankReconciliationItem Create(
        Guid bankReconciliationId,
        Guid cashTransactionId,
        DateTime itemDate,
        string description,
        decimal amount,
        Guid organizationId,
        bool isCleared = true,
        string? statementReference = null)
    {
        return new BankReconciliationItem
        {
            BankReconciliationId = bankReconciliationId,
            CashTransactionId = cashTransactionId,
            ItemDate = DateTime.SpecifyKind(itemDate, DateTimeKind.Utc),
            Description = description.Trim(),
            Amount = amount,
            IsCleared = isCleared,
            StatementReference = statementReference?.Trim(),
            OrganizationId = organizationId
        };
    }

    public void SetCleared(bool cleared, string? statementReference = null)
    {
        IsCleared = cleared;
        StatementReference = statementReference?.Trim();
    }
}
