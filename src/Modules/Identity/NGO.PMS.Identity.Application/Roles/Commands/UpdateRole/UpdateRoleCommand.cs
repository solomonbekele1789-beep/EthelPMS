using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Commands.UpdateRole;

public record UpdateRoleCommand(Guid Id, string Name, string? Description, List<Guid> PermissionIds) : IRequest;
