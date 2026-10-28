using MediatR;
using NGO.PMS.Identity.Application.Roles.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Roles.Queries.ListRoles;

public record ListRolesQuery(int Page = 1, int PageSize = 20, string? Search = null) : IRequest<PagedResponse<RoleListItemDto>>;
