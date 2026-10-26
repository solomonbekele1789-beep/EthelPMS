using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class RfqItem : AuditableEntity, IMultiTenant
{
    private RfqItem() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid RfqId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal Quantity { get; private set; }
    public string Unit { get; private set; } = null!;

    public static RfqItem Create(Guid rfqId, string description, decimal quantity, string unit, Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        return new RfqItem
        {
            RfqId = rfqId,
            Description = description,
            Quantity = quantity,
            Unit = unit,
            OrganizationId = orgId
        };
    }
}
