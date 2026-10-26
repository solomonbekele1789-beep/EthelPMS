namespace NGO.PMS.Projects.Application.DTOs;

public record ProjectListItemDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string OperationalStatus { get; init; } = string.Empty;
    public DateTimeOffset StartDate { get; init; }
    public DateTimeOffset EndDate { get; init; }
    public decimal TotalBudget { get; init; }
    public string? DonorName { get; init; }
    public int TotalDirectBeneficiaries { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
}
