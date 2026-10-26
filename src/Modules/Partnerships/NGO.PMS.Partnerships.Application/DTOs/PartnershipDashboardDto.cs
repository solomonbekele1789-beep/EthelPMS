namespace NGO.PMS.Partnerships.Application.DTOs;

public class PartnershipDashboardDto
{
    public int TotalPartners { get; set; }
    public int ActivePartners { get; set; }
    public decimal TotalDisbursed { get; set; }
    public int PendingReports { get; set; }
    public int OverdueCompliance { get; set; }
    public Dictionary<string, int> RiskDistribution { get; set; } = new();
}
