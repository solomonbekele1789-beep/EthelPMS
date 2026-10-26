using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Concrete task/activity under an output.
/// Hierarchy: Output → Activity
/// </summary>
public class Activity : AuditableEntity, ISoftDeletable
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Unit { get; private set; }
    public decimal? LifetimeTarget { get; private set; }
    public decimal? BudgetAllocated { get; private set; }
    public DateTimeOffset? PlannedStartDate { get; private set; }
    public DateTimeOffset? PlannedEndDate { get; private set; }
    public string? Assumptions { get; private set; }

    // Beneficiary disaggregation
    public int DirectBeneficiariesMale { get; private set; }
    public int DirectBeneficiariesFemale { get; private set; }
    public int IndirectBeneficiariesMale { get; private set; }
    public int IndirectBeneficiariesFemale { get; private set; }

    // Relationships
    public Guid OutputId { get; set; }
    public Guid? AssignedUserId { get; set; }
    public Guid OrganizationId { get; set; }

    // Soft delete
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Navigation
    public Output Output { get; set; } = null!;

    public static Activity Create(string code, string name, Guid outputId, Guid orgId)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new ArgumentException("Activity code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Activity name is required.", nameof(name));
        return new Activity
        {
            Code = code.Trim(),
            Name = name.Trim(),
            OutputId = outputId,
            OrganizationId = orgId
        };
    }

    public void Update(string name, string? description, string? unit,
        decimal? lifetimeTarget, decimal? budgetAllocated,
        DateTimeOffset? plannedStartDate, DateTimeOffset? plannedEndDate, string? assumptions)
    {
        Name = name.Trim();
        Description = description;
        Unit = unit;
        LifetimeTarget = lifetimeTarget;
        BudgetAllocated = budgetAllocated;
        PlannedStartDate = plannedStartDate;
        PlannedEndDate = plannedEndDate;
        Assumptions = assumptions;
    }

    public void AssignUser(Guid userId) => AssignedUserId = userId;
    public void UnassignUser() => AssignedUserId = null;

    public void UpdateBeneficiaries(int directMale, int directFemale, int indirectMale, int indirectFemale)
    {
        DirectBeneficiariesMale = directMale;
        DirectBeneficiariesFemale = directFemale;
        IndirectBeneficiariesMale = indirectMale;
        IndirectBeneficiariesFemale = indirectFemale;
    }
}
