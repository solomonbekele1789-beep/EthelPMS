using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class PaymentRequest : AuditableEntity, IMultiTenant
{
    private PaymentRequest() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string ReferenceNumber { get; private set; } = null!;
    public Guid SupplierInvoiceId { get; private set; }
    public Guid ProjectId { get; private set; }
    public PaymentStatus Status { get; private set; }
    public decimal Amount { get; private set; }
    public string? PaymentMethod { get; private set; }
    public string? BankDetails { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }
    public DateTime? PaymentDate { get; private set; }

    public static PaymentRequest Create(
        string referenceNumber,
        Guid invoiceId,
        Guid projectId,
        decimal amount,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(referenceNumber);

        return new PaymentRequest
        {
            ReferenceNumber = referenceNumber,
            SupplierInvoiceId = invoiceId,
            ProjectId = projectId,
            Amount = amount,
            Status = PaymentStatus.Pending,
            OrganizationId = orgId
        };
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Only pending payment requests can be approved.");

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = PaymentStatus.Approved;

        AddDomainEvent(new PaymentApprovedEvent(Id, Amount));
    }

    public void Reject(string reason)
    {
        if (Status != PaymentStatus.Pending)
            throw new InvalidOperationException("Only pending payment requests can be rejected.");

        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        RejectionReason = reason;
        Status = PaymentStatus.Rejected;
    }

    public void MarkPaid(DateTime paymentDate)
    {
        if (Status != PaymentStatus.Approved)
            throw new InvalidOperationException("Only approved payment requests can be marked as paid.");

        PaymentDate = paymentDate;
        Status = PaymentStatus.Paid;
    }
}
