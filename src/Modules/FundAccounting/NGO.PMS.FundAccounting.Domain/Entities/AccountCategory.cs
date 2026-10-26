using NGO.PMS.FundAccounting.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.FundAccounting.Domain.Entities;

public class AccountCategory : AuditableEntity
{
    public string Code { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public Guid? ParentCategoryId { get; private set; }
    public AccountType AccountType { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public Guid OrganizationId { get; set; }

    // Navigation properties
    public AccountCategory? ParentCategory { get; private set; }
    public List<AccountCategory> SubCategories { get; private set; } = [];
    public List<ChartOfAccount> Accounts { get; private set; } = [];

    private AccountCategory() { }

    public static AccountCategory Create(
        string code,
        string name,
        AccountType accountType,
        int sortOrder,
        Guid orgId)
    {
        var category = new AccountCategory
        {
            Code = code,
            Name = name,
            AccountType = accountType,
            SortOrder = sortOrder,
            IsActive = true,
            OrganizationId = orgId
        };

        return category;
    }

    public void Update(string name, int sortOrder)
    {
        Name = name;
        SortOrder = sortOrder;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void SetParent(Guid? parentId)
    {
        ParentCategoryId = parentId;
    }
}
