namespace NGO.PMS.Identity.Application.Roles.DTOs;

public record PermissionDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = default!;
    public string DisplayName { get; init; } = default!;
    public string Module { get; init; } = default!;
    public string Resource { get; init; } = default!;
    public string Action { get; init; } = default!;
}
