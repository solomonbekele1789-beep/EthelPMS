using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class GrnItem : AuditableEntity, IMultiTenant
{
    private GrnItem() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid GrnId { get; private set; }
    public Guid PurchaseOrderItemId { get; private set; }
    public decimal QuantityReceived { get; private set; }
    public decimal QuantityAccepted { get; private set; }
    public decimal QuantityRejected => QuantityReceived - QuantityAccepted;
    public string? RejectionReason { get; private set; }

    public static GrnItem Create(
        Guid grnId,
        Guid poItemId,
        decimal quantityReceived,
        decimal quantityAccepted,
        Guid orgId)
    {
        if (quantityAccepted > quantityReceived)
            throw new ArgumentException("Quantity accepted cannot exceed quantity received.");

        return new GrnItem
        {
            GrnId = grnId,
            PurchaseOrderItemId = poItemId,
            QuantityReceived = quantityReceived,
            QuantityAccepted = quantityAccepted,
            OrganizationId = orgId
        };
    }
}
