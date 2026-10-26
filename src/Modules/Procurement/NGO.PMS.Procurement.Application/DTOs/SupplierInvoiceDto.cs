namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record SupplierInvoiceDto
{
    public Guid Id { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public Guid SupplierId { get; init; }
    public Guid PurchaseOrderId { get; init; }
    public Guid? GrnId { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal InvoiceAmount { get; init; }
    public decimal? VerifiedAmount { get; init; }
    public DateTime InvoiceDate { get; init; }
    public DateTime? DueDate { get; init; }
    public string ThreeWayMatchStatus { get; init; } = string.Empty;
}
