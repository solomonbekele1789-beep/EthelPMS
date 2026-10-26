using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Domain.Enums;
using NGO.PMS.Tasks.Domain.Events;

namespace NGO.PMS.Tasks.Domain.Entities;

public class TaskItem : AuditableEntity, ISoftDeletable
{
    public Guid TaskListId { get; private set; }
    public Guid? ProjectId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TaskItemStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    public DateTime? DueDate { get; private set; }
    public int ProgressPercentage { get; private set; }
    public Guid? AssignedToUserId { get; private set; }
    public string? AssignedToName { get; private set; }
    public Guid? ParentTaskId { get; private set; }
    public int SortOrder { get; private set; }
    public Guid OrganizationId { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public List<TaskAssignment> Assignments { get; private set; } = [];
    public List<TaskComment> Comments { get; private set; } = [];
    public List<TaskApprovalLog> ApprovalLogs { get; private set; } = [];

    private TaskItem() { }

    public static TaskItem Create(
        Guid taskListId,
        string title,
        Guid organizationId,
        Guid? projectId = null,
        string? description = null,
        TaskPriority priority = TaskPriority.Medium,
        DateTime? dueDate = null,
        Guid? assignedToUserId = null,
        string? assignedToName = null,
        Guid? parentTaskId = null,
        int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        var task = new TaskItem
        {
            TaskListId = taskListId,
            ProjectId = projectId,
            Title = title,
            Description = description,
            Status = TaskItemStatus.ToDo,
            Priority = priority,
            DueDate = dueDate,
            ProgressPercentage = 0,
            AssignedToUserId = assignedToUserId,
            AssignedToName = assignedToName,
            ParentTaskId = parentTaskId,
            SortOrder = sortOrder,
            OrganizationId = organizationId
        };

        task.AddDomainEvent(new TaskCreatedEvent(task.Id, projectId ?? Guid.Empty, title));
        return task;
    }

    public void UpdateDetails(string title, string? description, TaskPriority priority, DateTime? dueDate)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);

        Title = title;
        Description = description;
        Priority = priority;
        DueDate = dueDate;
    }

    public void UpdateStatus(TaskItemStatus status)
    {
        Status = status;
    }

    public void UpdateProgress(int progressPercentage)
    {
        if (progressPercentage < 0 || progressPercentage > 100)
            throw new ArgumentOutOfRangeException(nameof(progressPercentage), "Progress must be between 0 and 100.");

        ProgressPercentage = progressPercentage;
    }

    public void AssignTo(Guid userId, string userName)
    {
        AssignedToUserId = userId;
        AssignedToName = userName;
    }

    public void MoveToList(Guid listId)
    {
        TaskListId = listId;
    }

    public void Complete()
    {
        if (ProgressPercentage != 100)
            throw new InvalidOperationException("Task progress must be 100% before completing.");

        Status = TaskItemStatus.Done;
        AddDomainEvent(new TaskCompletedEvent(Id, ProjectId ?? Guid.Empty));
    }
}
