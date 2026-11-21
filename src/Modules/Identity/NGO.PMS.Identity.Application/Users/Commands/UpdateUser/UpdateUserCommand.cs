using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? Phone,
    Guid? OfficeId,
    string? MiddleName = null,
    DateTime? DateOfBirth = null,
    string? Gender = null,
    string? Address = null,
    string? EmployeeId = null,
    DateTime? EmploymentDate = null,
    string? LevelOfEducation = null,
    string? Qualification = null,
    decimal? BasicSalary = null,
    Guid? ManagerId = null,
    string? ProfilePhotoUrl = null,
    string? Region = null,
    string? OfficeLevel = null,
    bool? IsActive = null) : IRequest;
