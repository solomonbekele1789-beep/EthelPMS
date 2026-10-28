namespace NGO.PMS.Partnerships.Application.DTOs;

public class SubGranteeDto
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? RegistrationNumber { get; set; }
    public string ContactPerson { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public string? ContactPhone { get; set; }
    public string? Address { get; set; }
    public string Country { get; set; } = string.Empty;
    public string PartnerType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public int? CapacityScore { get; set; }
    public DateTime? OnboardingDate { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
