using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ReactivateTenant;

public class ReactivateTenantCommandHandler : IRequestHandler<ReactivateTenantCommand>
{
    private readonly IPlatformDbContext _db;

    public ReactivateTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(ReactivateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        if (tenant.Status != TenantStatus.Suspended)
            throw new BusinessRuleException("Only suspended tenants can be reactivated.");

        tenant.Reactivate();
        await _db.SaveChangesAsync(cancellationToken);
    }
}
