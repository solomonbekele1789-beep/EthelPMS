namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record PurchaseOrderDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid PurchaseRequestId { get; init; }
    public Guid SupplierId { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public DateTime? ExpectedDeliveryDate { get; init; }
    public List<PurchaseOrderItemDto> Items { get; init; } = [];
}

public sealed record PurchaseOrderItemDto
{
    public Guid Id { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal UnitPrice { get; init; }
    public decimal ReceivedQuantity { get; init; }
}
