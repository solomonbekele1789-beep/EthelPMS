using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskAssignment : AuditableEntity
{
    public Guid TaskItemId { get; private set; }
    public Guid AssignedToUserId { get; private set; }
    public string AssignedToName { get; private set; } = string.Empty;
    public Guid AssignedByUserId { get; private set; }
    public DateTime AssignedDate { get; private set; }
    public string? Role { get; private set; }
    public Guid OrganizationId { get; set; }

    private TaskAssignment() { }

    public static TaskAssignment Create(
        Guid taskItemId,
        Guid assignedToUserId,
        string assignedToName,
        Guid assignedByUserId,
        Guid organizationId,
        string? role = null)
    {
        return new TaskAssignment
        {
            TaskItemId = taskItemId,
            AssignedToUserId = assignedToUserId,
            AssignedToName = assignedToName,
            AssignedByUserId = assignedByUserId,
            AssignedDate = DateTime.UtcNow,
            OrganizationId = organizationId,
            Role = role
        };
    }
}
