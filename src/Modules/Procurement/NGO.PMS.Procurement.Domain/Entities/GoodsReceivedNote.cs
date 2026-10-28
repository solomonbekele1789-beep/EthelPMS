using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class GoodsReceivedNote : AuditableEntity, IMultiTenant
{
    private GoodsReceivedNote() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string ReferenceNumber { get; private set; } = null!;
    public Guid PurchaseOrderId { get; private set; }
    public GrnStatus Status { get; private set; }
    public DateTime ReceivedDate { get; private set; }
    public string ReceivedBy { get; private set; } = null!;
    public string? DeliveryNoteNumber { get; private set; }
    public string? Remarks { get; private set; }

    public ICollection<GrnItem> Items { get; private set; } = [];

    public static GoodsReceivedNote Create(
        string referenceNumber,
        Guid purchaseOrderId,
        DateTime receivedDate,
        string receivedBy,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(referenceNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(receivedBy);

        return new GoodsReceivedNote
        {
            ReferenceNumber = referenceNumber,
            PurchaseOrderId = purchaseOrderId,
            ReceivedDate = receivedDate,
            ReceivedBy = receivedBy,
            Status = GrnStatus.Draft,
            OrganizationId = orgId
        };
    }

    public void AddItem(Guid poItemId, decimal quantityReceived, decimal quantityAccepted, string? remarks)
    {
        var item = GrnItem.Create(Id, poItemId, quantityReceived, quantityAccepted, OrganizationId);
        Items.Add(item);
    }

    public void Confirm()
    {
        if (Status != GrnStatus.Draft)
            throw new InvalidOperationException("Only draft GRNs can be confirmed.");

        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot confirm a GRN without at least one item.");

        Status = GrnStatus.Confirmed;

        AddDomainEvent(new GoodsReceivedEvent(Id, PurchaseOrderId));
    }
}
