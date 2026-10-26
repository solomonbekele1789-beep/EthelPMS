namespace NGO.PMS.Assets.Application.DTOs;

public class AssetMaintenanceDto
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public decimal? Cost { get; set; }
    public string? PerformedBy { get; set; }
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? NextScheduledDate { get; set; }
}
