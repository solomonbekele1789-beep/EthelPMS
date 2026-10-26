namespace NGO.PMS.Training.Application.DTOs;

public class TrainingSessionDto
{
    public Guid Id { get; set; }
    public Guid TrainingProgramId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Venue { get; set; }
    public DateTime ScheduledDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? MaxParticipants { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<TrainingParticipantDto> Participants { get; set; } = [];
}
