namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record AccountCategoryDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = null!;
    public string Name { get; init; } = null!;
    public Guid? ParentCategoryId { get; init; }
    public string AccountType { get; init; } = null!;
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
    public List<AccountCategoryDto> SubCategories { get; init; } = [];
}
