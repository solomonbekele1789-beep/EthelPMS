using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskBoard : AuditableEntity
{
    public string Name { get; private set; } = string.Empty;
    public Guid ProjectId { get; private set; }
    public string? Description { get; private set; }
    public bool IsDefault { get; private set; }
    public Guid OrganizationId { get; set; }

    public List<TaskList> Lists { get; private set; } = [];

    private TaskBoard() { }

    public static TaskBoard Create(string name, Guid projectId, Guid organizationId, string? description = null, bool isDefault = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new TaskBoard
        {
            Name = name,
            ProjectId = projectId,
            OrganizationId = organizationId,
            Description = description,
            IsDefault = isDefault
        };
    }

    public void Update(string name, string? description, bool isDefault)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name;
        Description = description;
        IsDefault = isDefault;
    }
}
