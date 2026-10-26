using MediatR;

namespace NGO.PMS.Identity.Application.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    Guid? OfficeId,
    List<Guid> RoleIds) : IRequest<Guid>;
