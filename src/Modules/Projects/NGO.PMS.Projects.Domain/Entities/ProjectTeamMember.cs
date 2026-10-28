using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Links a user to a project with a specific role.
/// </summary>
public class ProjectTeamMember : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; private set; } = string.Empty;
    public DateTimeOffset AssignedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? RemovedAt { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Navigation
    public Project Project { get; set; } = null!;

    public static ProjectTeamMember Create(Guid projectId, Guid userId, string role)
    {
        return new ProjectTeamMember
        {
            ProjectId = projectId,
            UserId = userId,
            Role = role.Trim()
        };
    }

    public void Remove()
    {
        IsActive = false;
        RemovedAt = DateTimeOffset.UtcNow;
    }
}
