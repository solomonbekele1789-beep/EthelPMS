using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class AssetDisposal : AuditableEntity
{
    public Guid AssetId { get; private set; }
    public DisposalStatus Status { get; private set; } = DisposalStatus.Pending;
    public string Reason { get; private set; } = string.Empty;
    public string DisposalMethod { get; private set; } = string.Empty;
    public decimal? DisposalValue { get; private set; }
    public decimal BookValueAtDisposal { get; private set; }
    public DateTime? DisposalDate { get; private set; }
    public bool RequiresDonorApproval { get; private set; }
    public Guid? DonorGrantId { get; private set; }
    public string? DonorApprovalReference { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTime? ApprovalDate { get; private set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static AssetDisposal Create(
        Guid assetId,
        string reason,
        string disposalMethod,
        decimal bookValue,
        bool requiresDonorApproval,
        Guid? donorGrantId,
        Guid orgId)
    {
        if (assetId == Guid.Empty)
            throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Disposal reason is required.", nameof(reason));
        if (string.IsNullOrWhiteSpace(disposalMethod))
            throw new ArgumentException("Disposal method is required.", nameof(disposalMethod));
        if (requiresDonorApproval && donorGrantId is null)
            throw new ArgumentException("Donor grant ID is required when donor approval is needed.", nameof(donorGrantId));

        return new AssetDisposal
        {
            AssetId = assetId,
            Reason = reason.Trim(),
            DisposalMethod = disposalMethod.Trim(),
            BookValueAtDisposal = bookValue,
            RequiresDonorApproval = requiresDonorApproval,
            DonorGrantId = donorGrantId,
            OrganizationId = orgId,
            Status = DisposalStatus.Pending
        };
    }

    public void RequestDonorApproval()
    {
        if (Status != DisposalStatus.Pending)
            throw new InvalidOperationException("Donor approval can only be requested for pending disposals.");
        if (!RequiresDonorApproval)
            throw new InvalidOperationException("This disposal does not require donor approval.");

        Status = DisposalStatus.DonorApprovalRequested;
    }

    public void ApproveDonorApproval(string approvalReference)
    {
        if (Status != DisposalStatus.DonorApprovalRequested)
            throw new InvalidOperationException("Donor approval can only be granted for requested disposals.");
        if (string.IsNullOrWhiteSpace(approvalReference))
            throw new ArgumentException("Approval reference is required.", nameof(approvalReference));

        Status = DisposalStatus.DonorApproved;
        DonorApprovalReference = approvalReference.Trim();
        ApprovalDate = DateTime.UtcNow;
    }

    public void RejectDonorApproval(string reason)
    {
        if (Status != DisposalStatus.DonorApprovalRequested)
            throw new InvalidOperationException("Donor approval can only be rejected for requested disposals.");
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Rejection reason is required.", nameof(reason));

        Status = DisposalStatus.DonorRejected;
        Reason = reason.Trim();
    }

    /// <summary>
    /// Completes the disposal. If donor approval is required, the disposal must have DonorApproved status (REQ-ASSET-004).
    /// </summary>
    public void Complete(decimal disposalValue, DateTime disposalDate, Guid approvedBy)
    {
        if (RequiresDonorApproval && Status != DisposalStatus.DonorApproved)
            throw new InvalidOperationException(
                "Cannot complete disposal: donor approval is required but has not been granted.");

        if (!RequiresDonorApproval && Status != DisposalStatus.Pending)
            throw new InvalidOperationException(
                "Disposal can only be completed from Pending status when donor approval is not required.");

        Status = DisposalStatus.Disposed;
        DisposalValue = disposalValue;
        DisposalDate = disposalDate;
        ApprovedBy = approvedBy;

        AddDomainEvent(new AssetDisposedEvent(AssetId, Id, disposalValue));
    }
}
