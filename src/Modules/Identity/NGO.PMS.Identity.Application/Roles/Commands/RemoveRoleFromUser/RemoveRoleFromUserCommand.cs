using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Commands.RemoveRoleFromUser;

public record RemoveRoleFromUserCommand(Guid UserId, Guid RoleId) : IRequest;
