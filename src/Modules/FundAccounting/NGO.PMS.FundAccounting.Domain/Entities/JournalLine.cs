using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class JournalLine : AuditableEntity
{
    public Guid JournalEntryId { get; private set; }
    public Guid AccountId { get; private set; }
    public decimal DebitAmount { get; private set; }
    public decimal CreditAmount { get; private set; }
    public string? Description { get; private set; }
    public Guid? FundCodeId { get; private set; }
    public Guid? ProjectId { get; private set; }
    public Guid OrganizationId { get; set; }

    private JournalLine() { }

    public static JournalLine Create(
        Guid journalEntryId,
        Guid accountId,
        decimal debitAmount,
        decimal creditAmount,
        Guid orgId)
    {
        if (debitAmount > 0 && creditAmount > 0)
            throw new InvalidOperationException(
                "A journal line cannot have both a debit and a credit amount.");

        if (debitAmount <= 0 && creditAmount <= 0)
            throw new InvalidOperationException(
                "A journal line must have either a debit or a credit amount greater than zero.");

        var line = new JournalLine
        {
            JournalEntryId = journalEntryId,
            AccountId = accountId,
            DebitAmount = debitAmount,
            CreditAmount = creditAmount,
            OrganizationId = orgId
        };

        return line;
    }

    internal void SetDescription(string description)
    {
        Description = description;
    }

    internal void SetFundCode(Guid fundCodeId)
    {
        FundCodeId = fundCodeId;
    }
}
