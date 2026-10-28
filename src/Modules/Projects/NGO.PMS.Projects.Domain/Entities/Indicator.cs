using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Measurable indicator linked to an Outcome or Output.
/// Can be linked to both via nullable FKs (one must be set).
/// </summary>
public class Indicator : AuditableEntity, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal? BaselineValue { get; private set; }
    public decimal? TargetValue { get; private set; }
    public string? DataSource { get; private set; }
    public string? CollectionFrequency { get; private set; }
    public string? MeansOfVerification { get; private set; }

    // Relationships
    public Guid? OutcomeId { get; set; }
    public Guid? OutputId { get; set; }
    public Guid? UnitOfMeasurementId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Outcome? Outcome { get; set; }
    public Output? Output { get; set; }
    public UnitOfMeasurement? UnitOfMeasurement { get; set; }
    public ICollection<IndicatorTarget> Targets { get; private set; } = [];

    public static Indicator Create(string code, string name, Guid projectId, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Indicator code is required.", nameof(code));
        return new Indicator
        {
            Code = code.Trim(),
            Name = name.Trim(),
            ProjectId = projectId,
            OrganizationId = orgId
        };
    }

    public void LinkToOutcome(Guid outcomeId) { OutcomeId = outcomeId; OutputId = null; }
    public void LinkToOutput(Guid outputId) { OutputId = outputId; OutcomeId = null; }

    public void Update(string name, string? description, decimal? baselineValue, decimal? targetValue,
        string? dataSource, string? collectionFrequency, string? meansOfVerification, Guid? unitId)
    {
        Name = name.Trim();
        Description = description;
        BaselineValue = baselineValue;
        TargetValue = targetValue;
        DataSource = dataSource;
        CollectionFrequency = collectionFrequency;
        MeansOfVerification = meansOfVerification;
        UnitOfMeasurementId = unitId;
    }
}
