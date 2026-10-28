namespace NGO.PMS.FundAccounting.Application.DTOs;

public sealed record FundRestrictionDto
{
    public Guid Id { get; init; }
    public Guid FundCodeId { get; init; }
    public string FundCodeName { get; init; } = null!;
    public string Description { get; init; } = null!;
    public decimal OriginalAmount { get; init; }
    public decimal ReleasedAmount { get; init; }
    public decimal RemainingAmount { get; init; }
    public string Status { get; init; } = null!;
    public string? ConditionDescription { get; init; }
    public DateTime? ExpiryDate { get; init; }
}
