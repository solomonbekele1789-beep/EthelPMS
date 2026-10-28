namespace NGO.PMS.Identity.Application.Users.DTOs;

public record CurrentUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    Guid OrganizationId,
    string OrganizationName,
    List<string> Permissions,
    List<string> Roles);
