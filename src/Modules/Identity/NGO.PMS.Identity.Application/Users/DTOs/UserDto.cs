namespace NGO.PMS.Identity.Application.Users.DTOs;

public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = default!;
    public string FirstName { get; init; } = default!;
    public string? MiddleName { get; init; }
    public string LastName { get; init; } = default!;
    public string FullName { get; init; } = default!;
    public string? Phone { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public string? Gender { get; init; }
    public string? Address { get; init; }
    public string? EmployeeId { get; init; }
    public DateTime? EmploymentDate { get; init; }
    public string? LevelOfEducation { get; init; }
    public string? Qualification { get; init; }
    public decimal? BasicSalary { get; init; }
    public Guid? ManagerId { get; init; }
    public string? ManagerName { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public string? Region { get; init; }
    public string? OfficeLevel { get; init; }
    public bool IsActive { get; init; }
    public bool EmailConfirmed { get; init; }
    public Guid? OfficeId { get; init; }
    public string? OfficeName { get; init; }
    public List<string> Roles { get; init; } = [];
    public DateTimeOffset CreatedAt { get; init; }
}
