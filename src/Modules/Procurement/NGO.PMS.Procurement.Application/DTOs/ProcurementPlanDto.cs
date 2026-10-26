namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record ProcurementPlanDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid ProjectId { get; init; }
    public int FiscalYear { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal TotalEstimatedValue { get; init; }
    public List<ProcurementPlanItemDto> Items { get; init; } = [];
}
