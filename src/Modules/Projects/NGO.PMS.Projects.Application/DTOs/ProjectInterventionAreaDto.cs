namespace NGO.PMS.Projects.Application.DTOs;

public record ProjectInterventionAreaDto
{
    public Guid Id { get; init; }
    public Guid InterventionAreaId { get; init; }
    public string InterventionAreaName { get; init; } = string.Empty;
    public decimal BudgetAllocated { get; init; }
    public decimal BudgetPercentage { get; init; }
    public int DirectBeneficiariesMale { get; init; }
    public int DirectBeneficiariesFemale { get; init; }
    public int IndirectBeneficiariesMale { get; init; }
    public int IndirectBeneficiariesFemale { get; init; }
}
