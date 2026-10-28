namespace NGO.PMS.Projects.Application.DTOs;

public record OutputDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal? BaselineValue { get; init; }
    public decimal? TargetValue { get; init; }
    public string? Assumptions { get; init; }
    public int DirectBeneficiariesMale { get; init; }
    public int DirectBeneficiariesFemale { get; init; }
    public Guid OutcomeId { get; init; }
    public List<ActivityDto> Activities { get; init; } = [];
    public List<IndicatorDto> Indicators { get; init; } = [];
}
