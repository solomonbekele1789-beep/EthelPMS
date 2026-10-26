namespace NGO.PMS.Identity.Application.Users.DTOs;

public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string LastName { get; init; } = default!;
    public string? Phone { get; init; }
    public bool IsActive { get; init; }
    public bool EmailConfirmed { get; init; }
    public Guid? OfficeId { get; init; }
    public string? OfficeName { get; init; }
    public List<string> Roles { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
}
