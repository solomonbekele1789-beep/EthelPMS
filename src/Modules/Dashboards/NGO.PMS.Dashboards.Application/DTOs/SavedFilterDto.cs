namespace NGO.PMS.Dashboards.Application.DTOs;

public record SavedFilterDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Module { get; init; } = string.Empty;
    public string? FilterJson { get; init; }
    public bool IsDefault { get; init; }
}
