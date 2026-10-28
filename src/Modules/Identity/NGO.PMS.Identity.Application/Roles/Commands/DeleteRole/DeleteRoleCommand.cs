using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Commands.DeleteRole;

public record DeleteRoleCommand(Guid Id) : IRequest;
