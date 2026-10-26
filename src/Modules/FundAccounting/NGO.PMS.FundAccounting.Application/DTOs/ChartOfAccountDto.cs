namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record ChartOfAccountDto
{
    public Guid Id { get; init; }
    public string AccountCode { get; init; } = null!;
    public string AccountName { get; init; } = null!;
    public string AccountType { get; init; } = null!;
    public Guid AccountCategoryId { get; init; }
    public string CategoryName { get; init; } = null!;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public bool IsSystemAccount { get; init; }
}
