using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class ProcurementPlan : AuditableEntity, IMultiTenant
{
    private ProcurementPlan() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string Title { get; private set; } = null!;
    public string ReferenceNumber { get; private set; } = null!;
    public Guid ProjectId { get; private set; }
    public int FiscalYear { get; private set; }
    public ProcurementStatus Status { get; private set; }
    public string? Description { get; private set; }
    public decimal TotalEstimatedValue { get; private set; }

    public ICollection<ProcurementPlanItem> Items { get; private set; } = [];

    public static ProcurementPlan Create(string title, Guid projectId, int fiscalYear, Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        return new ProcurementPlan
        {
            Title = title,
            ProjectId = projectId,
            FiscalYear = fiscalYear,
            Status = ProcurementStatus.Draft,
            OrganizationId = orgId
        };
    }

    public void AddItem(string description, decimal estimatedCost, ProcurementMethod procurementMethod, int quantity)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);

        var item = ProcurementPlanItem.Create(Id, description, estimatedCost, procurementMethod, quantity, OrganizationId);
        Items.Add(item);
        RecalculateTotalEstimatedValue();
    }

    public void Submit()
    {
        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot submit a procurement plan without at least one item.");

        Status = ProcurementStatus.Submitted;
    }

    public void Approve(string approvedBy)
    {
        if (Status != ProcurementStatus.Submitted)
            throw new InvalidOperationException("Only submitted procurement plans can be approved.");

        ArgumentException.ThrowIfNullOrWhiteSpace(approvedBy);
        Status = ProcurementStatus.Approved;
    }

    public void Reject(string reason)
    {
        if (Status != ProcurementStatus.Submitted)
            throw new InvalidOperationException("Only submitted procurement plans can be rejected.");

        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        Status = ProcurementStatus.Rejected;
    }

    private void RecalculateTotalEstimatedValue()
    {
        TotalEstimatedValue = Items.Sum(i => i.EstimatedCost * i.Quantity);
    }
}
