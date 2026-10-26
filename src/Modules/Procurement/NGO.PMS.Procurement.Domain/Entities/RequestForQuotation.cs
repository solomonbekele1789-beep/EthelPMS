using NGO.PMS.Procurement.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class RequestForQuotation : AuditableEntity, IMultiTenant
{
    private RequestForQuotation() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public string ReferenceNumber { get; private set; } = null!;
    public Guid PurchaseRequestId { get; private set; }
    public ProcurementStatus Status { get; private set; }
    public DateTime Deadline { get; private set; }
    public string? TermsAndConditions { get; private set; }
    public int MinimumResponses { get; private set; } = 3;

    public ICollection<RfqItem> Items { get; private set; } = [];
    public ICollection<RfqResponse> Responses { get; private set; } = [];

    public static RequestForQuotation Create(
        string referenceNumber,
        Guid purchaseRequestId,
        DateTime deadline,
        Guid orgId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(referenceNumber);

        return new RequestForQuotation
        {
            ReferenceNumber = referenceNumber,
            PurchaseRequestId = purchaseRequestId,
            Deadline = deadline,
            Status = ProcurementStatus.Draft,
            OrganizationId = orgId
        };
    }

    public void AddItem(string description, decimal quantity, string unit)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(description);
        ArgumentException.ThrowIfNullOrWhiteSpace(unit);

        var item = RfqItem.Create(Id, description, quantity, unit, OrganizationId);
        Items.Add(item);
    }

    public void Close()
    {
        if (Responses.Count < MinimumResponses)
            throw new InvalidOperationException(
                $"Cannot close RFQ. Minimum {MinimumResponses} responses required, but only {Responses.Count} received.");

        Status = ProcurementStatus.Approved;
    }
}
