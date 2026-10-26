namespace NGO.PMS.Donors.Application.DTOs;

public class ComplianceDashboardDto
{
    public Guid GrantId { get; set; }
    public string DonorName { get; set; } = string.Empty;
    public string GrantNumber { get; set; } = string.Empty;
    public string ComplianceStatus { get; set; } = string.Empty;
    public int OverdueConditions { get; set; }
    public DateTime? NextDueDate { get; set; }
}
