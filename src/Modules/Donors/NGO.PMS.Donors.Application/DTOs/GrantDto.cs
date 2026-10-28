namespace NGO.PMS.Donors.Application.DTOs;

public class GrantDto
{
    public Guid Id { get; set; }
    public Guid DonorId { get; set; }
    public string GrantNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string ComplianceStatus { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public decimal? CoFinancingAmount { get; set; }
    public string? CoFinancingPartner { get; set; }
    public List<GrantConditionDto> Conditions { get; set; } = [];
    public List<GrantReportDto> Reports { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
}
