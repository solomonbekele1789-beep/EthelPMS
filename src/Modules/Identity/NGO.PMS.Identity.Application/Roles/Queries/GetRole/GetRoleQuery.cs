using MediatR;
using NGO.PMS.Identity.Application.Roles.DTOs;

namespace NGO.PMS.Identity.Application.Roles.Queries.GetRole;

public record GetRoleQuery(Guid Id) : IRequest<RoleDto>;
