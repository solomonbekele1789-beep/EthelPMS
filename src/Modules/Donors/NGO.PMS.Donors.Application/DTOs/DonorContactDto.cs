namespace NGO.PMS.Donors.Application.DTOs;

public class DonorContactDto
{
    public Guid Id { get; set; }
    public Guid DonorId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsPrimary { get; set; }
}
