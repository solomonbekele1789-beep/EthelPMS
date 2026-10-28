using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Tracks amendments to approved projects.
/// </summary>
public class ProjectRevision : AuditableEntity
{
    public Guid ProjectId { get; set; }
    public int RevisionNumber { get; private set; }
    public string ChangeDescription { get; private set; } = string.Empty;
    public string? Justification { get; private set; }
    public string SnapshotJson { get; private set; } = string.Empty;
    public bool IsApproved { get; private set; }
    public Guid? ApprovedBy { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }

    // Navigation
    public Project Project { get; set; } = null!;

    public static ProjectRevision Create(Guid projectId, int revisionNumber,
        string changeDescription, string? justification, string snapshotJson)
    {
        return new ProjectRevision
        {
            ProjectId = projectId,
            RevisionNumber = revisionNumber,
            ChangeDescription = changeDescription.Trim(),
            Justification = justification,
            SnapshotJson = snapshotJson,
            IsApproved = false
        };
    }

    public void Approve(Guid approvedBy)
    {
        IsApproved = true;
        ApprovedBy = approvedBy;
        ApprovedAt = DateTimeOffset.UtcNow;
    }
}
