namespace NGO.PMS.Training.Application.DTOs;

public class TrainingParticipantDto
{
    public Guid Id { get; set; }
    public Guid TrainingSessionId { get; set; }
    public Guid? ParticipantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? AttendedAt { get; set; }
    public decimal? PreTestScore { get; set; }
    public decimal? PostTestScore { get; set; }
    public string? CertificateNumber { get; set; }
}
