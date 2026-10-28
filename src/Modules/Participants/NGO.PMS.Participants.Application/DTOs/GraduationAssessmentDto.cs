namespace NGO.PMS.Participants.Application.DTOs;

public class GraduationAssessmentDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public Guid BenchmarkId { get; set; }
    public decimal Score { get; set; }
    public string PillarStage { get; set; } = string.Empty;
    public DateTimeOffset AssessmentDate { get; set; }
    public Guid AssessedByUserId { get; set; }
    public string? Notes { get; set; }
}
