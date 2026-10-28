using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Commands.AssignRoleToUser;

public record AssignRoleToUserCommand(Guid UserId, Guid RoleId) : IRequest;
