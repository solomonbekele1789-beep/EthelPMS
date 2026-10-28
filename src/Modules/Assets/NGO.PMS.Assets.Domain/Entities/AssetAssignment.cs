using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class AssetAssignment : AuditableEntity
{
    public Guid AssetId { get; private set; }
    public Guid AssignedToUserId { get; private set; }
    public string AssignedToName { get; private set; } = string.Empty;
    public DateTime AssignmentDate { get; private set; }
    public DateTime? ReturnDate { get; private set; }
    public string? Notes { get; private set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static AssetAssignment Create(
        Guid assetId,
        Guid userId,
        string userName,
        DateTime assignmentDate,
        Guid orgId)
    {
        if (assetId == Guid.Empty)
            throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID is required.", nameof(userId));
        if (string.IsNullOrWhiteSpace(userName))
            throw new ArgumentException("User name is required.", nameof(userName));

        return new AssetAssignment
        {
            AssetId = assetId,
            AssignedToUserId = userId,
            AssignedToName = userName.Trim(),
            AssignmentDate = assignmentDate,
            OrganizationId = orgId
        };
    }

    public void Return(DateTime returnDate)
    {
        if (ReturnDate is not null)
            throw new InvalidOperationException("Assignment has already been returned.");
        if (returnDate < AssignmentDate)
            throw new ArgumentException("Return date cannot be before assignment date.", nameof(returnDate));

        ReturnDate = returnDate;
    }
}
