namespace NGO.PMS.Training.Application.DTOs;

public class TrainingProgramDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public Guid ProjectId { get; set; }
    public int TotalSessions { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
