using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Domain.Entities;

public class AssetMaintenance : AuditableEntity
{
    public Guid AssetId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime ScheduledDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public decimal? Cost { get; private set; }
    public string? PerformedBy { get; private set; }
    public string? Notes { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTime? NextScheduledDate { get; private set; }

    // Multi-tenancy
    public Guid OrganizationId { get; set; }

    public static AssetMaintenance Create(
        Guid assetId,
        string description,
        DateTime scheduledDate,
        Guid orgId)
    {
        if (assetId == Guid.Empty)
            throw new ArgumentException("Asset ID is required.", nameof(assetId));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Maintenance description is required.", nameof(description));

        return new AssetMaintenance
        {
            AssetId = assetId,
            Description = description.Trim(),
            ScheduledDate = scheduledDate,
            OrganizationId = orgId,
            IsCompleted = false
        };
    }

    public void Complete(
        DateTime completedDate,
        decimal? cost,
        string? performedBy,
        string? notes,
        DateTime? nextScheduledDate)
    {
        if (IsCompleted)
            throw new InvalidOperationException("Maintenance record is already completed.");
        if (completedDate < ScheduledDate)
            throw new ArgumentException("Completed date cannot be before scheduled date.", nameof(completedDate));

        CompletedDate = completedDate;
        Cost = cost;
        PerformedBy = performedBy;
        Notes = notes;
        NextScheduledDate = nextScheduledDate;
        IsCompleted = true;
    }
}
