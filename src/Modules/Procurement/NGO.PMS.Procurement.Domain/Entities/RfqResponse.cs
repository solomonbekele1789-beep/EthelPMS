using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Domain.Entities;

public class RfqResponse : AuditableEntity, IMultiTenant
{
    private RfqResponse() { }

    public Guid TenantId { get; set; }
    public Guid OrganizationId { get; set; }

    public Guid RfqId { get; private set; }
    public Guid SupplierId { get; private set; }
    public decimal TotalQuotedAmount { get; private set; }
    public DateTime SubmittedDate { get; private set; }
    public int DeliveryDays { get; private set; }
    public string? Notes { get; private set; }
    public bool IsSelected { get; private set; }

    public static RfqResponse Create(
        Guid rfqId,
        Guid supplierId,
        decimal totalQuotedAmount,
        int deliveryDays,
        Guid orgId)
    {
        return new RfqResponse
        {
            RfqId = rfqId,
            SupplierId = supplierId,
            TotalQuotedAmount = totalQuotedAmount,
            SubmittedDate = DateTime.UtcNow,
            DeliveryDays = deliveryDays,
            OrganizationId = orgId
        };
    }

    public void Select()
    {
        IsSelected = true;
    }
}
