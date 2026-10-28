using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Deliverable under an outcome.
/// Hierarchy: Outcome → Output → Activity
/// </summary>
public class Output : AuditableEntity, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal? BaselineValue { get; private set; }
    public decimal? TargetValue { get; private set; }
    public string? Assumptions { get; private set; }

    // Beneficiary disaggregation
    public int DirectBeneficiariesMale { get; private set; }
    public int DirectBeneficiariesFemale { get; private set; }
    public int IndirectBeneficiariesMale { get; private set; }
    public int IndirectBeneficiariesFemale { get; private set; }

    // Relationships
    public Guid OutcomeId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Outcome Outcome { get; set; } = null!;
    public ICollection<Activity> Activities { get; private set; } = [];
    public ICollection<Indicator> Indicators { get; private set; } = [];

    public static Output Create(string code, string description, Guid outcomeId, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Output code is required.", nameof(code));
        return new Output
        {
            Code = code.Trim(),
            Description = description.Trim(),
            OutcomeId = outcomeId,
            OrganizationId = orgId
        };
    }

    public void Update(string description, decimal? baselineValue, decimal? targetValue, string? assumptions)
    {
        Description = description.Trim();
        BaselineValue = baselineValue;
        TargetValue = targetValue;
        Assumptions = assumptions;
    }

    public void UpdateBeneficiaries(int directMale, int directFemale, int indirectMale, int indirectFemale)
    {
        DirectBeneficiariesMale = directMale;
        DirectBeneficiariesFemale = directFemale;
        IndirectBeneficiariesMale = indirectMale;
        IndirectBeneficiariesFemale = indirectFemale;
    }
}
