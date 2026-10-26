namespace NGO.PMS.Donors.Application.DTOs;

public class DonorDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Acronym { get; set; }
    public string? Country { get; set; }
    public string? Website { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public decimal? DefaultProcurementThreshold { get; set; }
    public List<DonorContactDto> Contacts { get; set; } = [];
    public int GrantCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
