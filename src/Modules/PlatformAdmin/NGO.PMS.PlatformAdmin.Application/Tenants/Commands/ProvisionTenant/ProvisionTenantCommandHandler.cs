using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Abstractions;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ProvisionTenant;

public class ProvisionTenantCommandHandler : IRequestHandler<ProvisionTenantCommand>
{
    private readonly IPlatformDbContext _db;
    private readonly ITenantProvisioningService? _provisioningService;

    public ProvisionTenantCommandHandler(
        IPlatformDbContext db,
        ITenantProvisioningService? provisioningService = null)
    {
        _db = db;
        _provisioningService = provisioningService;
    }

    public async Task Handle(ProvisionTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        if (tenant.Status != TenantStatus.Pending && tenant.Status != TenantStatus.Provisioning)
            throw new BusinessRuleException("Tenant must be in Pending or Provisioning status to provision.");

        tenant.StartProvisioning();
        await _db.SaveChangesAsync(cancellationToken);

        if (_provisioningService is not null)
        {
            await _provisioningService.ProvisionAsync(tenant.Id, cancellationToken);
        }
    }
}
