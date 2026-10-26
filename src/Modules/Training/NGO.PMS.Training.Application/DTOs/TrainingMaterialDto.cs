namespace NGO.PMS.Training.Application.DTOs;

public class TrainingMaterialDto
{
    public Guid Id { get; set; }
    public Guid TrainingProgramId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? FileUrl { get; set; }
    public string MaterialType { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
