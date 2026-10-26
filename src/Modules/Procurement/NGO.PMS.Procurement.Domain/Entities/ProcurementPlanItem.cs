using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class ProcurementPlanItem : AuditableEntity, IMultiTenant
{
    private ProcurementPlanItem() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid ProcurementPlanId { get; private set; }
    public string Description { get; private set; } = null!;
    public decimal EstimatedCost { get; private set; }
    public ProcurementMethod Method { get; private set; }
    public int Quantity { get; private set; }
    public string? Unit { get; private set; }
    public int PlannedQuarter { get; private set; }

    public static ProcurementPlanItem Create(
        Guid planId,
        string description,
        decimal estimatedCost,
        ProcurementMethod method,
        int quantity,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        return new ProcurementPlanItem
        {
            ProcurementPlanId = planId,
            Description = description,
            EstimatedCost = estimatedCost,
            Method = method,
            Quantity = quantity,
            OrganizationId = orgId
        };
    }

    public void Update(
        string description,
        decimal estimatedCost,
        ProcurementMethod method,
        int quantity,
        string? unit,
        int plannedQuarter)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        if (plannedQuarter < 1 || plannedQuarter > 4)
            throw new ArgumentOutOfRangeException(nameof(plannedQuarter), "Planned quarter must be between 1 and 4.");

        Description = description;
        EstimatedCost = estimatedCost;
        Method = method;
        Quantity = quantity;
        Unit = unit;
        PlannedQuarter = plannedQuarter;
    }
}
