namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskListDto
{
    public Guid Id { get; set; }
    public Guid TaskBoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string? Color { get; set; }
    public int TaskCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
