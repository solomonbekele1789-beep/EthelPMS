using MediatR;
using NGO.PMS.Identity.Application.Roles.DTOs;

namespace NGO.PMS.Identity.Application.Roles.Queries.ListPermissions;

public record ListPermissionsQuery(string? Module = null) : IRequest<List<PermissionDto>>;
