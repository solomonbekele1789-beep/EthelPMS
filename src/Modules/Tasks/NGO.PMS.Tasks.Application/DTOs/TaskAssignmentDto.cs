namespace NGO.PMS.Tasks.Application.DTOs;

public class TaskAssignmentDto
{
    public Guid Id { get; set; }
    public Guid TaskItemId { get; set; }
    public Guid AssignedToUserId { get; set; }
    public string AssignedToName { get; set; } = string.Empty;
    public Guid AssignedByUserId { get; set; }
    public DateTime AssignedDate { get; set; }
    public string? Role { get; set; }
}
