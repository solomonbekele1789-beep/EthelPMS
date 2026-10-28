using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.FundAccounting.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class JournalEntry : AuditableEntity
{
    public string ReferenceNumber { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public DateTime TransactionDate { get; private set; }
    public JournalEntryStatus Status { get; private set; }
    public decimal TotalDebit { get; private set; }
    public decimal TotalCredit { get; private set; }
    public Guid? ProjectId { get; private set; }
    public Guid? FundCodeId { get; private set; }
    public string? Memo { get; private set; }
    public Guid? ReversedFromId { get; private set; }
    public Guid OrganizationId { get; set; }

    // Navigation properties
    public List<JournalLine> Lines { get; private set; } = [];

    private JournalEntry() { }

    public static JournalEntry Create(
        string referenceNumber,
        string description,
        DateTime transactionDate,
        Guid orgId)
    {
        var entry = new JournalEntry
        {
            ReferenceNumber = referenceNumber,
            Description = description,
            TransactionDate = transactionDate,
            Status = JournalEntryStatus.Draft,
            TotalDebit = 0,
            TotalCredit = 0,
            OrganizationId = orgId
        };

        return entry;
    }

    public void AddLine(
        Guid accountId,
        decimal debitAmount,
        decimal creditAmount,
        string? description,
        Guid? fundCodeId)
    {
        var line = JournalLine.Create(Id, accountId, debitAmount, creditAmount, OrganizationId);

        if (description is not null)
            line.SetDescription(description);

        if (fundCodeId.HasValue)
            line.SetFundCode(fundCodeId.Value);

        Lines.Add(line);
        RecalculateTotals();
    }

    public void Post()
    {
        if (Status != JournalEntryStatus.Draft)
            throw new InvalidOperationException("Only draft journal entries can be posted.");

        if (Lines.Count == 0)
            throw new InvalidOperationException("Cannot post a journal entry with no lines.");

        if (TotalDebit != TotalCredit)
            throw new InvalidOperationException(
                $"Journal entry is unbalanced. Total debits ({TotalDebit}) must equal total credits ({TotalCredit}).");

        Status = JournalEntryStatus.Posted;

        AddDomainEvent(new JournalEntryPostedEvent(Id, TotalDebit));
    }

    public JournalEntry Reverse(string newReferenceNumber)
    {
        if (Status != JournalEntryStatus.Posted)
            throw new InvalidOperationException("Only posted journal entries can be reversed.");

        Status = JournalEntryStatus.Reversed;

        var reversalEntry = new JournalEntry
        {
            ReferenceNumber = newReferenceNumber,
            Description = $"Reversal of {ReferenceNumber}",
            TransactionDate = DateTime.UtcNow,
            Status = JournalEntryStatus.Draft,
            ReversedFromId = Id,
            ProjectId = ProjectId,
            FundCodeId = FundCodeId,
            OrganizationId = OrganizationId
        };

        foreach (var line in Lines)
        {
            reversalEntry.AddLine(
                line.AccountId,
                line.CreditAmount,
                line.DebitAmount,
                line.Description,
                line.FundCodeId);
        }

        return reversalEntry;
    }

    private void RecalculateTotals()
    {
        TotalDebit = Lines.Sum(l => l.DebitAmount);
        TotalCredit = Lines.Sum(l => l.CreditAmount);
    }
}
