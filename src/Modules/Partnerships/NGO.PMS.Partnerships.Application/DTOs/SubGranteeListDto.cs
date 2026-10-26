namespace NGO.PMS.Partnerships.Application.DTOs;

public class SubGranteeListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PartnerType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string RiskRating { get; set; } = string.Empty;
    public int? CapacityScore { get; set; }
    public string Country { get; set; } = string.Empty;
}
