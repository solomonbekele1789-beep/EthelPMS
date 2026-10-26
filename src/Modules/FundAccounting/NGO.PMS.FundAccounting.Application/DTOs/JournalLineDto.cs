namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record JournalLineDto
{
    public Guid Id { get; init; }
    public Guid AccountId { get; init; }
    public string AccountName { get; init; } = null!;
    public decimal DebitAmount { get; init; }
    public decimal CreditAmount { get; init; }
    public string? Description { get; init; }
    public Guid? FundCodeId { get; init; }
}
