namespace NGO.PMS.Planning.Application.DTOs;

public class DipMilestoneDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTimeOffset DueDate { get; set; }
    public DateTimeOffset? CompletedDate { get; set; }
    public bool IsCompleted { get; set; }
}
