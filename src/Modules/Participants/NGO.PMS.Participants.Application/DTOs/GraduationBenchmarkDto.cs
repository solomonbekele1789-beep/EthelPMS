namespace NGO.PMS.Participants.Application.DTOs;

public class GraduationBenchmarkDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Domain { get; set; } = string.Empty;
    public decimal ThresholdP2 { get; set; }
    public decimal ThresholdP3 { get; set; }
    public decimal ThresholdP4 { get; set; }
    public bool RequiredForGraduation { get; set; }
    public decimal Weight { get; set; }
    public bool IsActive { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
