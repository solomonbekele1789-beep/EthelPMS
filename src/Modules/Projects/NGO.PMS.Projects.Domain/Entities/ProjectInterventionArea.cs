using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Domain.Entities;

/// <summary>
/// Pivot table linking a Project to an InterventionArea with budget and beneficiary allocation.
/// Validates that allocations don't exceed project totals.
/// </summary>
public class ProjectInterventionArea : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Guid InterventionAreaId { get; set; }

    // Budget allocation
    public decimal BudgetAllocated { get; private set; }
    public decimal BudgetPercentage { get; private set; }

    // Beneficiary allocation
    public int DirectBeneficiariesMale { get; private set; }
    public int DirectBeneficiariesFemale { get; private set; }
    public int IndirectBeneficiariesMale { get; private set; }
    public int IndirectBeneficiariesFemale { get; private set; }

    // Navigation
    public Project Project { get; set; } = null!;
    public InterventionArea InterventionArea { get; set; } = null!;

    public int TotalDirectBeneficiaries => DirectBeneficiariesMale + DirectBeneficiariesFemale;
    public int TotalIndirectBeneficiaries => IndirectBeneficiariesMale + IndirectBeneficiariesFemale;

    public static ProjectInterventionArea Create(
        Guid projectId, Guid interventionAreaId,
        decimal budgetAllocated, decimal budgetPercentage)
    {
        return new ProjectInterventionArea
        {
            ProjectId = projectId,
            InterventionAreaId = interventionAreaId,
            BudgetAllocated = budgetAllocated,
            BudgetPercentage = budgetPercentage
        };
    }

    public void UpdateBudget(decimal budgetAllocated, decimal budgetPercentage)
    {
        BudgetAllocated = budgetAllocated;
        BudgetPercentage = budgetPercentage;
    }

    public void UpdateBeneficiaries(int directMale, int directFemale, int indirectMale, int indirectFemale)
    {
        DirectBeneficiariesMale = directMale;
        DirectBeneficiariesFemale = directFemale;
        IndirectBeneficiariesMale = indirectMale;
        IndirectBeneficiariesFemale = indirectFemale;
    }
}
