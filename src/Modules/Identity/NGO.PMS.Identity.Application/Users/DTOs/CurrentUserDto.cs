namespace NGO.PMS.Identity.Application.Users.DTOs;

public record TenantInfoDto(
    Guid Id,
    string Name,
    string Slug,
    List<string> Modules);

public record CurrentUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    Guid OrganizationId,
    string OrganizationName,
    List<string> Permissions,
    List<string> Roles,
    TenantInfoDto? Tenant = null);
