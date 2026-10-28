using MediatR;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenant;

public record GetTenantQuery(Guid TenantId) : IRequest<TenantDetailDto>;
