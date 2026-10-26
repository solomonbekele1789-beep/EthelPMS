using MediatR;

namespace NGO.PMS.Identity.Application.Roles.Commands.CreateRole;

public record CreateRoleCommand(string Name, string? Description, List<Guid> PermissionIds) : IRequest<Guid>;
