namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record GoodsReceivedNoteDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid PurchaseOrderId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime ReceivedDate { get; init; }
    public string ReceivedBy { get; init; } = string.Empty;
    public List<GrnItemDto> Items { get; init; } = [];
}

public sealed record GrnItemDto
{
    public Guid Id { get; init; }
    public Guid PurchaseOrderItemId { get; init; }
    public decimal QuantityReceived { get; init; }
    public decimal QuantityAccepted { get; init; }
    public string? RejectionReason { get; init; }
}
