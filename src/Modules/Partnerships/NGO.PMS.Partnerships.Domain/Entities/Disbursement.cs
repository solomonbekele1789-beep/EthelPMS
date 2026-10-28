using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Partnerships.Domain.Entities;

public class Disbursement : AuditableEntity, IMultiTenant
{
    public Guid OrganizationId { get; private set; }
    public Guid SubGranteeId { get; private set; }
    public Guid? GrantId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = string.Empty;
    public DateTime DisbursementDate { get; private set; }
    public string ReferenceNumber { get; private set; } = string.Empty;
    public string Purpose { get; private set; } = string.Empty;
    public DisbursementStatus Status { get; private set; }
    public Guid? ApprovedById { get; private set; }
    public DateTime? ApprovedAt { get; private set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private Disbursement() { }

    public static Disbursement Create(
        Guid organizationId,
        Guid subGranteeId,
        Guid? grantId,
        decimal amount,
        string currency,
        DateTime disbursementDate,
        string referenceNumber,
        string purpose)
    {
        if (subGranteeId == Guid.Empty)
            throw new ArgumentException("Sub-grantee ID is required.", nameof(subGranteeId));
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.", nameof(amount));
        if (string.IsNullOrWhiteSpace(currency) || currency.Length != 3)
            throw new ArgumentException("Currency must be a 3-character code.", nameof(currency));
        if (string.IsNullOrWhiteSpace(referenceNumber))
            throw new ArgumentException("Reference number is required.", nameof(referenceNumber));
        if (string.IsNullOrWhiteSpace(purpose))
            throw new ArgumentException("Purpose is required.", nameof(purpose));

        var disbursement = new Disbursement
        {
            OrganizationId = organizationId,
            SubGranteeId = subGranteeId,
            GrantId = grantId,
            Amount = amount,
            Currency = currency.ToUpperInvariant(),
            DisbursementDate = disbursementDate,
            ReferenceNumber = referenceNumber,
            Purpose = purpose,
            Status = DisbursementStatus.Pending
        };

        disbursement.AddDomainEvent(new DisbursementCreatedEvent(disbursement.Id, subGranteeId, amount, currency));

        return disbursement;
    }

    public void Approve(Guid approverId)
    {
        if (Status != DisbursementStatus.Pending)
            throw new InvalidOperationException("Only pending disbursements can be approved.");

        Status = DisbursementStatus.Approved;
        ApprovedById = approverId;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Disburse()
    {
        if (Status != DisbursementStatus.Approved)
            throw new InvalidOperationException("Only approved disbursements can be disbursed.");

        Status = DisbursementStatus.Disbursed;
    }

    public void Reject()
    {
        if (Status != DisbursementStatus.Pending)
            throw new InvalidOperationException("Only pending disbursements can be rejected.");

        Status = DisbursementStatus.Rejected;
    }
}
