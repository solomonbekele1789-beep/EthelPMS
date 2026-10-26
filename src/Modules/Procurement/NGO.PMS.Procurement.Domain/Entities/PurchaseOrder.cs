using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class PurchaseOrder : AuditableEntity, IMultiTenant
{
    private PurchaseOrder() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string ReferenceNumber { get; private set; } = null!;
    public Guid PurchaseRequestId { get; private set; }
    public Guid SupplierId { get; private set; }
    public Guid? RfqResponseId { get; private set; }
    public PurchaseOrderStatus Status { get; private set; }
    public decimal TotalAmount { get; private set; }
    public DateTime? ExpectedDeliveryDate { get; private set; }
    public string? DeliveryAddress { get; private set; }
    public string? PaymentTerms { get; private set; }
    public string? SpecialConditions { get; private set; }

    public ICollection<PurchaseOrderItem> Items { get; private set; } = [];

    public static PurchaseOrder Create(
        string referenceNumber,
        Guid purchaseRequestId,
        Guid supplierId,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(referenceNumber);

        return new PurchaseOrder
        {
            ReferenceNumber = referenceNumber,
            PurchaseRequestId = purchaseRequestId,
            SupplierId = supplierId,
            Status = PurchaseOrderStatus.Draft,
            OrganizationId = orgId
        };
    }

    public void AddItem(string description, decimal quantity, string unit, decimal unitPrice)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        var item = PurchaseOrderItem.Create(Id, description, quantity, unit, unitPrice, OrganizationId);
        Items.Add(item);
        RecalculateTotalAmount();
    }

    public void Issue()
    {
        if (Status != PurchaseOrderStatus.Draft)
            throw new InvalidOperationException("Only draft purchase orders can be issued.");

        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot issue a purchase order without at least one item.");

        Status = PurchaseOrderStatus.Issued;

        AddDomainEvent(new PurchaseOrderIssuedEvent(Id, SupplierId, TotalAmount));
    }

    public void MarkPartiallyReceived()
    {
        if (Status != PurchaseOrderStatus.Issued && Status != PurchaseOrderStatus.PartiallyReceived)
            throw new InvalidOperationException(
                "Purchase order must be issued or partially received to record partial receipt.");

        Status = PurchaseOrderStatus.PartiallyReceived;
    }

    public void MarkFullyReceived()
    {
        if (Status != PurchaseOrderStatus.Issued && Status != PurchaseOrderStatus.PartiallyReceived)
            throw new InvalidOperationException(
                "Purchase order must be issued or partially received to mark as fully received.");

        Status = PurchaseOrderStatus.FullyReceived;
    }

    public void Close()
    {
        if (Status != PurchaseOrderStatus.FullyReceived)
            throw new InvalidOperationException("Only fully received purchase orders can be closed.");

        Status = PurchaseOrderStatus.Closed;
    }

    public void Cancel(string reason)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        if (Status == PurchaseOrderStatus.Closed)
            throw new InvalidOperationException("Cannot cancel a closed purchase order.");

        Status = PurchaseOrderStatus.Cancelled;
    }

    private void RecalculateTotalAmount()
    {
        TotalAmount = Items.Sum(i => i.UnitPrice * i.Quantity);
    }
}
