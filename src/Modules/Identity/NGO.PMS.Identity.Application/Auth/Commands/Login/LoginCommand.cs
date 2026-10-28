using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password, string? DeviceInfo) : IRequest<LoginResponse>;

public record LoginResponse(string AccessToken, string RefreshToken, LoginUserProfile User);

public record LoginUserProfile(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    Guid OrganizationId,
    string OrganizationName,
    Guid? OfficeId,
    string? OfficeName,
    List<string> Roles,
    List<string> Permissions);
