using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.SuspendTenant;

public class SuspendTenantCommandHandler : IRequestHandler<SuspendTenantCommand>
{
    private readonly IPlatformDbContext _db;

    public SuspendTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(SuspendTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        if (tenant.Status != TenantStatus.Active)
            throw new BusinessRuleException("Only active tenants can be suspended.");

        tenant.Suspend(request.Reason);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
