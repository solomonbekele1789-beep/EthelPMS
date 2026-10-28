using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// High-level project outcome (strategic objective).
/// Hierarchy: Project → Outcome → Output → Activity
/// </summary>
public class Outcome : AuditableEntity, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal? BaselineValue { get; private set; }
    public decimal? TargetValue { get; private set; }
    public string? Assumptions { get; private set; }

    // Beneficiary disaggregation at outcome level
    public int DirectBeneficiariesMale { get; private set; }
    public int DirectBeneficiariesFemale { get; private set; }
    public int IndirectBeneficiariesMale { get; private set; }
    public int IndirectBeneficiariesFemale { get; private set; }

    // Relationships
    public Guid ProjectId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Project Project { get; set; } = null!;
    public ICollection<Output> Outputs { get; private set; } = [];
    public ICollection<Indicator> Indicators { get; private set; } = [];

    public static Outcome Create(string code, string description, Guid projectId, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Outcome code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("Description is required.", nameof(description));

        return new Outcome
        {
            Code = code.Trim(),
            Description = description.Trim(),
            ProjectId = projectId,
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
