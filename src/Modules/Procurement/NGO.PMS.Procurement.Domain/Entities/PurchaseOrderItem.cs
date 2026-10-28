using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class PurchaseOrderItem : AuditableEntity, IMultiTenant
{
    private PurchaseOrderItem() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid PurchaseOrderId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;
    public decimal UnitPrice { get; private set; }
    public decimal ReceivedQuantity { get; private set; }

    public static PurchaseOrderItem Create(
        Guid poId,
        string description,
        decimal quantity,
        string unit,
        decimal unitPrice,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        return new PurchaseOrderItem
        {
            PurchaseOrderId = poId,
            Description = description,
            Quantity = quantity,
            Unit = unit,
            UnitPrice = unitPrice,
            ReceivedQuantity = 0,
            OrganizationId = orgId
        };
    }

    public void RecordReceipt(decimal quantityReceived)
    {
        if (quantityReceived <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantityReceived), "Quantity received must be positive.");

        ReceivedQuantity += quantityReceived;
    }
}
