namespace NGO.PMS.Settings.Application.DTOs;

public record AlertThresholdDto
{
    public Guid Id { get; init; }
    public string Module { get; init; } = string.Empty;
    public string MetricName { get; init; } = string.Empty;
    public decimal ThresholdValue { get; init; }
    public string Operator { get; init; } = string.Empty;
    public string AlertSeverity { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}
