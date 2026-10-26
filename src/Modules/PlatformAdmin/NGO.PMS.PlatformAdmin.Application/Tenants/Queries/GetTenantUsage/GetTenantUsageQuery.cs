using MediatR;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenantUsage;

public record GetTenantUsageQuery(Guid TenantId) : IRequest<TenantUsageDto>;
