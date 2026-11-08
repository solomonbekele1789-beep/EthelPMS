namespace NGO.PMS.Projects.Application.DTOs;

public record ProjectDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public string OperationalStatus { get; init; } = string.Empty;
    public DateTimeOffset StartDate { get; init; }
    public DateTimeOffset EndDate { get; init; }
    public decimal TotalBudget { get; init; }
    public Guid CurrencyId { get; init; }
    public string? DonorName { get; init; }
    public string? Sector { get; init; }
    public string? ProgramPillar { get; init; }
    public int DirectBeneficiariesMale { get; init; }
    public int DirectBeneficiariesFemale { get; init; }
    public int IndirectBeneficiariesMale { get; init; }
    public int IndirectBeneficiariesFemale { get; init; }
    public int BeneficiariesPwd { get; init; }
    public int TotalDirectBeneficiaries { get; init; }
    public int TotalIndirectBeneficiaries { get; init; }
    public string? Assumptions { get; init; }
    public string? Risks { get; init; }
    public string? MeansOfVerification { get; init; }
    public string? Scope { get; init; }
    public Guid? OfficeId { get; init; }
    public Guid? ProjectManagerId { get; init; }
    public Guid? ApprovedBy { get; init; }
    public DateTimeOffset? ApprovedAt { get; init; }
    public string? RejectionReason { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public List<ProjectInterventionAreaDto> InterventionAreas { get; init; } = [];
}
