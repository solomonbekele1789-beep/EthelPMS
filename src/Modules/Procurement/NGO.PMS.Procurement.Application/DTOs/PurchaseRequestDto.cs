namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record PurchaseRequestDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid ProjectId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string Justification { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Method { get; init; } = string.Empty;
    public List<PurchaseRequestItemDto> Items { get; init; } = [];
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovalDate { get; init; }
}
