using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    Guid? OfficeId,
    List<Guid> RoleIds,
    string? MiddleName = null,
    DateTime? DateOfBirth = null,
    string? Gender = null,
    string? Address = null,
    string? Password = null,
    string? EmployeeId = null,
    DateTime? EmploymentDate = null,
    string? LevelOfEducation = null,
    string? Qualification = null,
    decimal? BasicSalary = null,
    Guid? ManagerId = null,
    string? ProfilePhotoUrl = null,
    string? Region = null,
    string? OfficeLevel = null) : IRequest<Guid>;
