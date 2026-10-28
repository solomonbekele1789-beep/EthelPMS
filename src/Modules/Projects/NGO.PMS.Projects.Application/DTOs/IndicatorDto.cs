namespace NGO.PMS.Projects.Application.DTOs;

public record IndicatorDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal? BaselineValue { get; init; }
    public decimal? TargetValue { get; init; }
    public string? DataSource { get; init; }
    public string? CollectionFrequency { get; init; }
    public Guid? OutcomeId { get; init; }
    public Guid? OutputId { get; init; }
    public Guid? UnitOfMeasurementId { get; init; }
    public Guid ProjectId { get; init; }
    public List<IndicatorTargetDto> Targets { get; init; } = [];
}
