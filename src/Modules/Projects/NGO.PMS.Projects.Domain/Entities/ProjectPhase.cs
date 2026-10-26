using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Time-bound phase within a project (e.g., Year 1, Year 2).
/// </summary>
public class ProjectPhase : AuditableEntity
{
    public Guid ProjectId { get; set; }
    public string Name { get; private set; } = string.Empty;
    public int Sequence { get; private set; }
    public DateTimeOffset StartDate { get; private set; }
    public DateTimeOffset EndDate { get; private set; }

    // Navigation
    public Project Project { get; set; } = null!;

    public static ProjectPhase Create(Guid projectId, string name, int sequence,
        DateTimeOffset startDate, DateTimeOffset endDate)
    {
        return new ProjectPhase
        {
            ProjectId = projectId,
            Name = name.Trim(),
            Sequence = sequence,
            StartDate = startDate,
            EndDate = endDate
        };
    }
}
