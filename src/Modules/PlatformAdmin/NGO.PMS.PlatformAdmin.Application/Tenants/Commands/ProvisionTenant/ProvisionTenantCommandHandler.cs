using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ProvisionTenant;

public class ProvisionTenantCommandHandler : IRequestHandler<ProvisionTenantCommand>
{
    private readonly IPlatformDbContext _db;

    public ProvisionTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(ProvisionTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        if (tenant.Status != TenantStatus.Pending)
            throw new BusinessRuleException("Tenant must be in Pending status to provision.");

        tenant.StartProvisioning();
        await _db.SaveChangesAsync(cancellationToken);

        // TODO: Enqueue Hangfire background job for actual tenant provisioning
        // e.g. BackgroundJob.Enqueue<ITenantProvisioningService>(s => s.ProvisionAsync(tenant.Id, CancellationToken.None));
        // The ITenantProvisioningService handles database creation, schema migration,
        // seed data, and calls ActivateTenant upon successful completion.
    }
}
