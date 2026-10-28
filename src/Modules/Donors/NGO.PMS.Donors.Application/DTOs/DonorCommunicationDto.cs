namespace NGO.PMS.Donors.Application.DTOs;

public class DonorCommunicationDto
{
    public Guid Id { get; set; }
    public Guid DonorId { get; set; }
    public Guid? GrantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Content { get; set; }
    public DateTime CommunicationDate { get; set; }
    public string ContactedBy { get; set; } = string.Empty;
    public string? Outcome { get; set; }
}
