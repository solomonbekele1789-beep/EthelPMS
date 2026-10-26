namespace NGO.PMS.Participants.Application.DTOs;

public class ParticipantEnrollmentDto
{
    public Guid Id { get; set; }
    public Guid ParticipantId { get; set; }
    public Guid ProjectId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset EnrollmentDate { get; set; }
    public DateTimeOffset? ExitDate { get; set; }
    public string? ExitReason { get; set; }
    public string? CohortName { get; set; }
}
