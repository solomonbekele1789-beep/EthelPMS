namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record ProcurementPlanItemDto
{
    public Guid Id { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal EstimatedCost { get; init; }
    public string Method { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public string? Unit { get; init; }
    public int PlannedQuarter { get; init; }
}
