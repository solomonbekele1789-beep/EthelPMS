namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskBoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public string? Description { get; set; }
    public bool IsDefault { get; set; }
    public List<TaskListDto> Lists { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; }
}
