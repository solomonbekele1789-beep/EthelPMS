namespace NGO.PMS.Participants.Application.DTOs;

public class ParticipantListItemDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string ParticipantCode { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Woreda { get; set; }
    public decimal? VulnerabilityScore { get; set; }
    public DateTimeOffset RegistrationDate { get; set; }
}
