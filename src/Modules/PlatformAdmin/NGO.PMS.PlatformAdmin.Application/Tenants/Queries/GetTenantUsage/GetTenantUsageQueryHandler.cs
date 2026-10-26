using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenantUsage;

public class GetTenantUsageQueryHandler : IRequestHandler<GetTenantUsageQuery, TenantUsageDto>
{
    private readonly IPlatformDbContext _db;

    public GetTenantUsageQueryHandler(IPlatformDbContext db)
    {
        _db = db;
    }

    public async Task<TenantUsageDto> Handle(GetTenantUsageQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        // TODO: Cross-module query — the platform module has no direct access to
        // the identity schema (RLS-isolated). Wire up an ICrossModuleQueryService
        // or MediatR notification to fetch actual user/project counts from the
        // Identity and ProjectManagement modules. For now, return limits only.
        var currentUsers = 0;
        var currentProjects = 0;

        return new TenantUsageDto(
            CurrentUsers: currentUsers,
            MaxUsers: tenant.MaxUsers,
            CurrentProjects: currentProjects,
            MaxProjects: tenant.MaxProjects);
    }
}
