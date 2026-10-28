using NGO.PMS.Assets.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class AssetTransfer : AuditableEntity
{
    public Guid AssetId { get; private set; }
    public string FromLocation { get; private set; } = string.Empty;
    public string ToLocation { get; private set; } = string.Empty;
    public DateTime TransferDate { get; private set; }
    public string Reason { get; private set; } = string.Empty;
    public string ApprovedBy { get; private set; } = string.Empty;

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static AssetTransfer Create(
        Guid assetId,
        string fromLocation,
        string toLocation,
        DateTime transferDate,
        string reason,
        string approvedBy,
        Guid orgId)
    {
        if (assetId == Guid.Empty)
            throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (string.IsNullOrWhiteSpace(fromLocation))
            throw new ArgumentException("From location is required.", nameof(fromLocation));
        if (string.IsNullOrWhiteSpace(toLocation))
            throw new ArgumentException("To location is required.", nameof(toLocation));
        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Transfer reason is required.", nameof(reason));
        if (string.IsNullOrWhiteSpace(approvedBy))
            throw new ArgumentException("Approver is required.", nameof(approvedBy));

        var transfer = new AssetTransfer
        {
            AssetId = assetId,
            FromLocation = fromLocation.Trim(),
            ToLocation = toLocation.Trim(),
            TransferDate = transferDate,
            Reason = reason.Trim(),
            ApprovedBy = approvedBy.Trim(),
            OrganizationId = orgId
        };

        transfer.AddDomainEvent(new AssetTransferredEvent(
            transfer.AssetId, transfer.Id, transfer.FromLocation, transfer.ToLocation));
        return transfer;
    }
}
