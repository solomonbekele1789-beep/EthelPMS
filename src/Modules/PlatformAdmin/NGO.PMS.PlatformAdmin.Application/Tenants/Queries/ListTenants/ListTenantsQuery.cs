using MediatR;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenants;

public record ListTenantsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    string? Status = null) : IRequest<PagedResponse<TenantListItemDto>>;
