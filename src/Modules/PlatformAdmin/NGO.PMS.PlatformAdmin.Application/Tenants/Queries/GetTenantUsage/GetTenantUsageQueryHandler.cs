using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Abstractions;
using NGO.PMS.PlatformAdmin.Application.Tenants.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Queries.GetTenantUsage;

public class GetTenantUsageQueryHandler : IRequestHandler<GetTenantUsageQuery, TenantUsageDto>
{
    private readonly IPlatformDbContext _db;
    private readonly ITenantUsageReader? _usageReader;

    public GetTenantUsageQueryHandler(
        IPlatformDbContext db,
        ITenantUsageReader? usageReader = null)
    {
        _db = db;
        _usageReader = usageReader;
    }

    public async Task<TenantUsageDto> Handle(GetTenantUsageQuery request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        var actual = _usageReader is not null
            ? await _usageReader.GetUsageAsync(tenant.Id, cancellationToken)
            : new TenantActualUsage(0, 0, 0);

        return new TenantUsageDto(
            CurrentUsers: actual.CurrentUsers,
            MaxUsers: tenant.MaxUsers,
            CurrentProjects: actual.CurrentProjects,
            MaxProjects: tenant.MaxProjects,
            StorageUsedBytes: actual.StorageUsedBytes);
    }
}
