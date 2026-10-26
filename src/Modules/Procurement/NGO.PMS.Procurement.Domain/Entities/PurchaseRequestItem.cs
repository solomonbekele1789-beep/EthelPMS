using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class PurchaseRequestItem : AuditableEntity, IMultiTenant
{
    private PurchaseRequestItem() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid PurchaseRequestId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;
    public decimal EstimatedUnitCost { get; private set; }
    public string? Specification { get; private set; }

    public static PurchaseRequestItem Create(
        Guid requestId,
        string description,
        decimal quantity,
        string unit,
        decimal estimatedUnitCost,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        return new PurchaseRequestItem
        {
            PurchaseRequestId = requestId,
            Description = description,
            Quantity = quantity,
            Unit = unit,
            EstimatedUnitCost = estimatedUnitCost,
            OrganizationId = orgId
        };
    }
}
