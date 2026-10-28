namespace NGO.PMS.Procurement.Application.DTOs;

public sealed record PaymentRequestDto
{
    public Guid Id { get; init; }
    public string ReferenceNumber { get; init; } = string.Empty;
    public Guid SupplierInvoiceId { get; init; }
    public Guid ProjectId { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public string? PaymentMethod { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTime? ApprovalDate { get; init; }
    public DateTime? PaymentDate { get; init; }
}
