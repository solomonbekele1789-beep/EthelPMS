using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Domain.Entities;

public class PettyCashFund : AuditableEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public Guid CustodianUserId { get; private set; }
    public Guid? OfficeId { get; private set; }
    public Guid BankAccountId { get; private set; }
    public string CurrencyCode { get; private set; } = "ETB";
    public decimal ImprestLimit { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public decimal ReplenishmentThreshold { get; private set; }
    public bool IsActive { get; private set; }
    public Guid OrganizationId { get; set; }

    private PettyCashFund() { }

    public static PettyCashFund Create(
        string code,
        string name,
        Guid custodianUserId,
        Guid bankAccountId,
        string currencyCode,
        decimal imprestLimit,
        decimal replenishmentThreshold,
        Guid organizationId,
        Guid? officeId = null)
    {
        if (imprestLimit <= 0)
            throw new ArgumentOutOfRangeException(nameof(imprestLimit), "Imprest limit must be positive.");
        if (replenishmentThreshold < 0 || replenishmentThreshold > imprestLimit)
            throw new ArgumentOutOfRangeException(nameof(replenishmentThreshold), "Threshold must be between 0 and imprest limit.");

        return new PettyCashFund
        {
            Code = code.Trim(),
            Name = name.Trim(),
            CustodianUserId = custodianUserId,
            OfficeId = officeId,
            BankAccountId = bankAccountId,
            CurrencyCode = string.IsNullOrWhiteSpace(currencyCode) ? "ETB" : currencyCode.Trim().ToUpperInvariant(),
            ImprestLimit = imprestLimit,
            CurrentBalance = imprestLimit,
            ReplenishmentThreshold = replenishmentThreshold,
            IsActive = true,
            OrganizationId = organizationId
        };
    }

    public void Disburse(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Disbursement amount must be positive.");
        if (amount > CurrentBalance)
            throw new InvalidOperationException("Insufficient petty cash balance.");
        CurrentBalance -= amount;
    }

    public void Replenish(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Replenishment amount must be positive.");
        if (CurrentBalance + amount > ImprestLimit)
            throw new InvalidOperationException("Replenishment exceeds the imprest limit.");
        CurrentBalance += amount;
    }

    public bool NeedsReplenishment => CurrentBalance <= ReplenishmentThreshold;

    public void Deactivate() => IsActive = false;
}
