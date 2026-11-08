namespace NGO.PMS.Projects.Application.DTOs;

public record ProjectTeamMemberDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public Guid UserId { get; init; }
    public string Role { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public DateTimeOffset AssignedAt { get; init; }
    public bool IsActive { get; init; }
}
