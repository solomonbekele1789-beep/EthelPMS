using MediatR;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenantModules;

public record ListTenantModulesQuery(Guid TenantId) : IRequest<List<TenantModuleDto>>;
