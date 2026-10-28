using NGO.PMS.MEAL.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Domain.Entities;

/// <summary>
/// MEAL-specific indicator tracking per REQ-MEAL-002/003.
/// Links to the results framework indicator via IndicatorId,
/// adds MEAL-specific metadata: data quality, collection tools, frequencies.
/// </summary>
public class MealIndicator : AuditableEntity
{
    public Guid MealPlanId { get; private set; }

    /// <summary>
    /// Reference to the Projects module indicator.
    /// </summary>
    public Guid? IndicatorId { get; private set; }

    public string Name { get; private set; } = string.Empty;
    public IndicatorLevel Level { get; private set; }
    public decimal? BaselineValue { get; private set; }
    public decimal? TargetValue { get; private set; }

    // Section 1: Results & Indicators (REQ-MEAL-002)
    public string? MeansOfVerification { get; private set; }
    public string? DataSource { get; private set; }
    public string? CollectionTool { get; private set; }
    public CollectionFrequency CollectionFrequency { get; private set; }

    // Section 2: Data Quality (REQ-MEAL-003)
    public string? AnalysisMethod { get; private set; }
    public string? QualityRisks { get; private set; }
    public string? VerificationMethod { get; private set; }
    public CollectionFrequency? VerificationFrequency { get; private set; }

    // Section 3: Disaggregation (REQ-MEAL-024)
    public string? DisaggregationTypes { get; private set; }

    public Guid OrganizationId { get; set; }

    // Navigation
    public MealPlan? MealPlan { get; private set; }
    public ICollection<IndicatorMeasurement> Measurements { get; private set; } = [];

    public static MealIndicator Create(
        Guid mealPlanId, string name, IndicatorLevel level,
        CollectionFrequency frequency, Guid orgId,
        Guid? indicatorId = null, decimal? baselineValue = null,
        decimal? targetValue = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Indicator name is required.", nameof(name));

        return new MealIndicator
        {
            MealPlanId = mealPlanId,
            IndicatorId = indicatorId,
            Name = name.Trim(),
            Level = level,
            CollectionFrequency = frequency,
            BaselineValue = baselineValue,
            TargetValue = targetValue,
            OrganizationId = orgId
        };
    }

    public void UpdateDataQuality(string? analysisMethod, string? qualityRisks,
        string? verificationMethod, CollectionFrequency? verificationFrequency)
    {
        AnalysisMethod = analysisMethod;
        QualityRisks = qualityRisks;
        VerificationMethod = verificationMethod;
        VerificationFrequency = verificationFrequency;
    }

    public void UpdateDetails(string? meansOfVerification, string? dataSource,
        string? collectionTool, string? disaggregationTypes)
    {
        MeansOfVerification = meansOfVerification;
        DataSource = dataSource;
        CollectionTool = collectionTool;
        DisaggregationTypes = disaggregationTypes;
    }
}
