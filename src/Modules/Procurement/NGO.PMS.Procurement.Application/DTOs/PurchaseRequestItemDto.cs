namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record PurchaseRequestItemDto
{
    public Guid Id { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal EstimatedUnitCost { get; init; }
    public string? Specification { get; init; }
}
