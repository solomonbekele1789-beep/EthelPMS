namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record BudgetDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = null!;
    public Guid ProjectId { get; init; }
    public int FiscalYear { get; init; }
    public string Status { get; init; } = null!;
    public string CurrencyCode { get; init; } = null!;
    public decimal ExchangeRate { get; init; }
    public decimal TotalAmount { get; init; }
    public int Version { get; init; }
    public List<BudgetLineDto> Lines { get; init; } = [];
}
