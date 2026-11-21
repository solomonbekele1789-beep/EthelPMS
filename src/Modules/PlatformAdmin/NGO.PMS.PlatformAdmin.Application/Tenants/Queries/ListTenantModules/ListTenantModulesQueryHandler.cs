using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.ListTenantModules;

public class ListTenantModulesQueryHandler : IRequestHandler<ListTenantModulesQuery, List<TenantModuleDto>>
{
    private readonly IPlatformDbContext _db;

    public ListTenantModulesQueryHandler(IPlatformDbContext db) => _db = db;

    public async Task<List<TenantModuleDto>> Handle(ListTenantModulesQuery request, CancellationToken cancellationToken)
    {
        var exists = await _db.Tenants.AnyAsync(t => t.Id == request.TenantId, cancellationToken);
        if (!exists) throw new NotFoundException("Tenant", request.TenantId);

        var existing = await _db.TenantModules
            .AsNoTracking()
            .Where(m => m.TenantId == request.TenantId)
            .ToDictionaryAsync(m => m.ModuleName, StringComparer.OrdinalIgnoreCase, cancellationToken);

        return PlatformModules.All
            .Select(name =>
            {
                if (existing.TryGetValue(name, out var mod))
                    return new TenantModuleDto(mod.ModuleName, mod.IsEnabled, mod.EnabledAt);
                return new TenantModuleDto(name, false, null);
            })
            .ToList();
    }
}
