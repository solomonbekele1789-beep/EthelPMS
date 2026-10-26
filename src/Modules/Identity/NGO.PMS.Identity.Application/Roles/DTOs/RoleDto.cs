namespace NGO.PMS.Identity.Application.Roles.DTOs;

public record RoleDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public string? Description { get; init; }
    public bool IsSystemRole { get; init; }
    public List<PermissionDto> Permissions { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
}

public record RoleListItemDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = default!;
    public string? Description { get; init; }
    public bool IsSystemRole { get; init; }
    public int PermissionCount { get; init; }
    public int UserCount { get; init; }
}
