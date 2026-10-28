namespace NGO.PMS.Projects.Application.DTOs;

/// <summary>
/// Full logical framework hierarchy for a project.
/// Project → Outcomes → Outputs → Activities, with Indicators at each level.
/// </summary>
public record LogframeDto
{
    public Guid ProjectId { get; init; }
    public string ProjectCode { get; init; } = string.Empty;
    public string ProjectName { get; init; } = string.Empty;
    public List<LogframeOutcomeDto> Outcomes { get; init; } = [];
}

public record LogframeOutcomeDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? Assumptions { get; init; }
    public List<IndicatorDto> Indicators { get; init; } = [];
    public List<LogframeOutputDto> Outputs { get; init; } = [];
}

public record LogframeOutputDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? Assumptions { get; init; }
    public List<IndicatorDto> Indicators { get; init; } = [];
    public List<LogframeActivityDto> Activities { get; init; } = [];
}

public record LogframeActivityDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Unit { get; init; }
    public decimal? LifetimeTarget { get; init; }
    public decimal? BudgetAllocated { get; init; }
    public string? Assumptions { get; init; }
}
