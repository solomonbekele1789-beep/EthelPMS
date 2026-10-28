using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskList : AuditableEntity
{
    public Guid TaskBoardId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }
    public string? Color { get; private set; }
    public Guid OrganizationId { get; set; }

    public List<TaskItem> Tasks { get; private set; } = [];

    private TaskList() { }

    public static TaskList Create(Guid taskBoardId, string name, int sortOrder, Guid organizationId, string? color = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new TaskList
        {
            TaskBoardId = taskBoardId,
            Name = name,
            SortOrder = sortOrder,
            OrganizationId = organizationId,
            Color = color
        };
    }

    public void Update(string name, string? color)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name;
        Color = color;
    }

    public void Reorder(int sortOrder)
    {
        SortOrder = sortOrder;
    }
}
