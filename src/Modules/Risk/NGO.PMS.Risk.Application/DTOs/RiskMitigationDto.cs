namespace NGO.PMS.Risk.Application.DTOs;

public class RiskMitigationDto
{
    public Guid Id { get; set; }
    public Guid RiskId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? ResponsiblePerson { get; set; }
    public Guid? ResponsibleUserId { get; set; }
    public DateTime PlannedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? EstimatedCost { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
