namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record BudgetLineDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string AccountName { get; init; } = null!;
    public string Description { get; init; } = null!;
    public decimal Q1Amount { get; init; }
    public decimal Q2Amount { get; init; }
    public decimal Q3Amount { get; init; }
    public decimal Q4Amount { get; init; }
    public decimal AnnualAmount { get; init; }
    public decimal ActualAmount { get; init; }
    public decimal Variance { get; init; }
    public decimal UtilizationRate { get; init; }
}
