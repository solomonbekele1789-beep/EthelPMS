using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.Procurement.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class PurchaseRequest : AuditableEntity, IMultiTenant
{
    private PurchaseRequest() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string ReferenceNumber { get; private set; } = null!;
    public Guid ProjectId { get; private set; }
    public Guid? ProcurementPlanItemId { get; private set; }
    public ProcurementStatus Status { get; private set; }
    public string Justification { get; private set; } = null!;
    public decimal TotalAmount { get; private set; }
    public ProcurementMethod Method { get; private set; }
    public string? RejectionReason { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    public ICollection<PurchaseRequestItem> Items { get; private set; } = [];

    public static PurchaseRequest Create(
        string referenceNumber,
        Guid projectId,
        string justification,
        ProcurementMethod method,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(referenceNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(justification);

        return new PurchaseRequest
        {
            ReferenceNumber = referenceNumber,
            ProjectId = projectId,
            Justification = justification,
            Method = method,
            Status = ProcurementStatus.Draft,
            OrganizationId = orgId
        };
    }

    public void AddItem(string description, decimal quantity, string unit, decimal estimatedUnitCost)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        var item = PurchaseRequestItem.Create(Id, description, quantity, unit, estimatedUnitCost, OrganizationId);
        Items.Add(item);
        RecalculateTotalAmount();
    }

    public void Submit()
    {
        if (Items.Count == 0)
            throw new InvalidOperationException("Cannot submit a purchase request without at least one item.");

        Status = ProcurementStatus.Submitted;
    }

    public void Approve(Guid approvedBy)
    {
        if (Status != ProcurementStatus.Submitted)
            throw new InvalidOperationException("Only submitted purchase requests can be approved.");

        ApprovedBy = approvedBy;
        ApprovalDate = DateTime.UtcNow;
        Status = ProcurementStatus.Approved;

        AddDomainEvent(new PurchaseRequestApprovedEvent(Id, ProjectId));
    }

    public void Reject(string reason)
    {
        if (Status != ProcurementStatus.Submitted)
            throw new InvalidOperationException("Only submitted purchase requests can be rejected.");

        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        RejectionReason = reason;
        Status = ProcurementStatus.Rejected;
    }

    private void RecalculateTotalAmount()
    {
        TotalAmount = Items.Sum(i => i.EstimatedUnitCost * i.Quantity);
    }
}
