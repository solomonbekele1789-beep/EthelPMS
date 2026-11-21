using MediatR;

namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password, string? DeviceInfo) : IRequest<LoginResponse>;

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    LoginUserProfile User,
    int ExpiresIn = 21600);

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
