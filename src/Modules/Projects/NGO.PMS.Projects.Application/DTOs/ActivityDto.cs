namespace NGO.PMS.Projects.Application.DTOs;

public record ActivityDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public decimal? LifetimeTarget { get; init; }
    public decimal? BudgetAllocated { get; init; }
    public DateTimeOffset? PlannedStartDate { get; init; }
    public DateTimeOffset? PlannedEndDate { get; init; }
    public Guid? AssignedUserId { get; init; }
    public Guid OutputId { get; init; }
}
