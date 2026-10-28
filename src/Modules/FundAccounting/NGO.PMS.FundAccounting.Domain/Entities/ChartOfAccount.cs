using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class ChartOfAccount : AuditableEntity, ISoftDeletable
{
    public string AccountCode { get; private set; } = null!;
    public string AccountName { get; private set; } = null!;
    public AccountType AccountType { get; private set; }
    public Guid AccountCategoryId { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsSystemAccount { get; private set; }
    public Guid OrganizationId { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    private ChartOfAccount() { }

    public static ChartOfAccount Create(
        string accountCode,
        string accountName,
        AccountType accountType,
        Guid categoryId,
        Guid orgId)
    {
        var account = new ChartOfAccount
        {
            AccountCode = accountCode,
            AccountName = accountName,
            AccountType = accountType,
            AccountCategoryId = categoryId,
            IsActive = true,
            IsSystemAccount = false,
            OrganizationId = orgId
        };

        return account;
    }

    public void Update(string accountName, string? description)
    {
        AccountName = accountName;
        Description = description;
    }

    public void Deactivate()
    {
        if (IsSystemAccount)
            throw new InvalidOperationException("System accounts cannot be deactivated.");

        IsActive = false;
    }
}
