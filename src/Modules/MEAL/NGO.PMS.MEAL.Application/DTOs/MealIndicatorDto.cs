namespace NGO.PMS.MEAL.Application.DTOs;

public class MealIndicatorDto
{
    public Guid Id { get; set; }
    public Guid MealPlanId { get; set; }
    public Guid? IndicatorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public decimal? BaselineValue { get; set; }
    public decimal? TargetValue { get; set; }
    public string? MeansOfVerification { get; set; }
    public string? DataSource { get; set; }
    public string? CollectionTool { get; set; }
    public string CollectionFrequency { get; set; } = string.Empty;
    public string? AnalysisMethod { get; set; }
    public string? QualityRisks { get; set; }
    public string? VerificationMethod { get; set; }
    public string? DisaggregationTypes { get; set; }
}
