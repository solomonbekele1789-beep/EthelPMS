using NGO.PMS.CashBank.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.CashBank.Domain.Entities;

public class BankAccount : AuditableEntity
{
    public string AccountCode { get; private set; } = null!;
    public string AccountName { get; private set; } = null!;
    public string BankName { get; private set; } = null!;
    public string? BranchName { get; private set; }
    public string AccountNumber { get; private set; } = null!;
    public string? SwiftCode { get; private set; }
    public string CurrencyCode { get; private set; } = "ETB";
    public BankAccountType AccountType { get; private set; }
    public decimal OpeningBalance { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public Guid? GlAccountId { get; private set; }
    public Guid? FundCodeId { get; private set; }
    public Guid? OfficeId { get; private set; }
    public bool IsActive { get; private set; }
    public Guid OrganizationId { get; set; }

    private BankAccount() { }

    public static BankAccount Create(
        string accountCode,
        string accountName,
        string bankName,
        string accountNumber,
        string currencyCode,
        BankAccountType accountType,
        decimal openingBalance,
        Guid organizationId,
        string? branchName = null,
        string? swiftCode = null,
        Guid? glAccountId = null,
        Guid? fundCodeId = null,
        Guid? officeId = null)
    {
        return new BankAccount
        {
            AccountCode = accountCode.Trim(),
            AccountName = accountName.Trim(),
            BankName = bankName.Trim(),
            BranchName = branchName?.Trim(),
            AccountNumber = accountNumber.Trim(),
            SwiftCode = swiftCode?.Trim(),
            CurrencyCode = string.IsNullOrWhiteSpace(currencyCode) ? "ETB" : currencyCode.Trim().ToUpperInvariant(),
            AccountType = accountType,
            OpeningBalance = openingBalance,
            CurrentBalance = openingBalance,
            GlAccountId = glAccountId,
            FundCodeId = fundCodeId,
            OfficeId = officeId,
            IsActive = true,
            OrganizationId = organizationId
        };
    }

    public void Update(
        string accountName,
        string bankName,
        string? branchName,
        string? swiftCode,
        Guid? glAccountId,
        Guid? fundCodeId,
        Guid? officeId)
    {
        AccountName = accountName.Trim();
        BankName = bankName.Trim();
        BranchName = branchName?.Trim();
        SwiftCode = swiftCode?.Trim();
        GlAccountId = glAccountId;
        FundCodeId = fundCodeId;
        OfficeId = officeId;
    }

    public void ApplyBalanceDelta(decimal delta)
    {
        if (!IsActive)
            throw new InvalidOperationException("Cannot post transactions to an inactive bank account.");
        CurrentBalance += delta;
    }

    public void Deactivate() => IsActive = false;
}
