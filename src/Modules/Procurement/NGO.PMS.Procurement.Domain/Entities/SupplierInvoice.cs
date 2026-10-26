using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class SupplierInvoice : AuditableEntity, IMultiTenant
{
    private SupplierInvoice() { }

    private const decimal MatchingTolerance = 0.01m;

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string InvoiceNumber { get; private set; } = null!;
    public Guid SupplierId { get; private set; }
    public Guid PurchaseOrderId { get; private set; }
    public Guid? GrnId { get; private set; }
    public InvoiceStatus Status { get; private set; }
    public decimal InvoiceAmount { get; private set; }
    public decimal? VerifiedAmount { get; private set; }
    public DateTime InvoiceDate { get; private set; }
    public DateTime? DueDate { get; private set; }
    public MatchingStatus ThreeWayMatchStatus { get; private set; }
    public string? DisputeReason { get; private set; }

    public static SupplierInvoice Create(
        string invoiceNumber,
        Guid supplierId,
        Guid purchaseOrderId,
        decimal invoiceAmount,
        DateTime invoiceDate,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(invoiceNumber);

        return new SupplierInvoice
        {
            InvoiceNumber = invoiceNumber,
            SupplierId = supplierId,
            PurchaseOrderId = purchaseOrderId,
            InvoiceAmount = invoiceAmount,
            InvoiceDate = invoiceDate,
            Status = InvoiceStatus.Pending,
            ThreeWayMatchStatus = MatchingStatus.Pending,
            OrganizationId = orgId
        };
    }

    public void LinkToGrn(Guid grnId)
    {
        GrnId = grnId;
    }

    public void Verify(decimal verifiedAmount)
    {
        if (Status != InvoiceStatus.Pending)
            throw new InvalidOperationException("Only pending invoices can be verified.");

        VerifiedAmount = verifiedAmount;
        Status = InvoiceStatus.Verified;
    }

    public void PerformThreeWayMatch(decimal poAmount, decimal grnAmount)
    {
        var invoiceMatchesPo = Math.Abs(InvoiceAmount - poAmount) <= MatchingTolerance;
        var invoiceMatchesGrn = Math.Abs(InvoiceAmount - grnAmount) <= MatchingTolerance;

        if (invoiceMatchesPo && invoiceMatchesGrn)
        {
            ThreeWayMatchStatus = MatchingStatus.Matched;
            Status = InvoiceStatus.Matched;
        }
        else
        {
            ThreeWayMatchStatus = MatchingStatus.Discrepancy;
        }

        AddDomainEvent(new InvoiceMatchedEvent(Id, PurchaseOrderId, ThreeWayMatchStatus));
    }

    public void MarkDisputed(string reason)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        DisputeReason = reason;
        Status = InvoiceStatus.Disputed;
    }

    public void MarkPaid()
    {
        if (Status != InvoiceStatus.Matched && Status != InvoiceStatus.Verified)
            throw new InvalidOperationException("Only matched or verified invoices can be marked as paid.");

        Status = InvoiceStatus.Paid;
    }
}
