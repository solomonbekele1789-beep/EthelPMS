namespace NGO.PMS.Settings.Application.DTOs;

public record ApprovalConfigDto
{
    public Guid Id { get; init; }
    public string Module { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public int RequiredApprovalLevels { get; init; }
    public decimal? AutoApproveBelow { get; init; }
    public bool IsActive { get; init; }
}
