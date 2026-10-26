using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ActivateTenant;

public class ActivateTenantCommandHandler : IRequestHandler<ActivateTenantCommand>
{
    private readonly IPlatformDbContext _db;

    public ActivateTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(ActivateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        if (tenant.Status != TenantStatus.Provisioning)
            throw new BusinessRuleException("Tenant must be in Provisioning status to activate.");

        tenant.Activate();
        await _db.SaveChangesAsync(cancellationToken);
    }
}
