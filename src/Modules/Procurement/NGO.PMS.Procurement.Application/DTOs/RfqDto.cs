namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record RfqDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid PurchaseRequestId { get; init; }
    public string Status { get; init; } = string.Empty;
    public DateTime Deadline { get; init; }
    public int MinimumResponses { get; init; }
    public List<RfqItemDto> Items { get; init; } = [];
    public List<RfqResponseDto> Responses { get; init; } = [];
}

public sealed record RfqItemDto
{
    public Guid Id { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string Unit { get; init; } = string.Empty;
}

public sealed record RfqResponseDto
{
    public Guid Id { get; init; }
    public Guid SupplierId { get; init; }
    public decimal TotalQuotedAmount { get; init; }
    public DateTime SubmittedDate { get; init; }
    public int DeliveryDays { get; init; }
    public string? Notes { get; init; }
    public bool IsSelected { get; init; }
}
