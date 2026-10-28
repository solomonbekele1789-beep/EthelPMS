namespace NGO.PMS.Identity.Application.Users.DTOs;

public record UserListItemDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = default!;
    public string FullName { get; init; } = default!;
    public bool IsActive { get; init; }
    public string? OfficeName { get; init; }
    public List<string> Roles { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
}
