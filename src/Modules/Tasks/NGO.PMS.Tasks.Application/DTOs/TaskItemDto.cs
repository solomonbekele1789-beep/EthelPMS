namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskItemDto
{
    public Guid Id { get; set; }
    public Guid TaskListId { get; set; }
    public Guid? ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int ProgressPercentage { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? AssignedToName { get; set; }
    public Guid? ParentTaskId { get; set; }
    public int SortOrder { get; set; }
    public List<TaskAssignmentDto> Assignments { get; set; } = [];
    public int CommentsCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
