namespace NGO.PMS.Projects.Application.DTOs;

public record IndicatorTargetDto
{
    public Guid Id { get; init; }
    public string Period { get; init; } = string.Empty;
    public decimal TargetValue { get; init; }
    public decimal? ActualValue { get; init; }
}
