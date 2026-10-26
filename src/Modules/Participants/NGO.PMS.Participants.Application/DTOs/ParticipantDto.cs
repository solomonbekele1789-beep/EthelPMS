namespace NGO.PMS.Participants.Application.DTOs;

public class ParticipantDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string ParticipantCode { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }
    public string? IdNumber { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset RegistrationDate { get; set; }
    public string? Region { get; set; }
    public string? Zone { get; set; }
    public string? Woreda { get; set; }
    public string? Kebele { get; set; }
    public decimal? VulnerabilityScore { get; set; }
    public Guid? HouseholdId { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<ParticipantEnrollmentDto> Enrollments { get; set; } = [];
}
