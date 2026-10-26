using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenantBranding;

public class UpdateTenantBrandingCommandHandler : IRequestHandler<UpdateTenantBrandingCommand>
{
    private readonly IPlatformDbContext _db;

    public UpdateTenantBrandingCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(UpdateTenantBrandingCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        tenant.UpdateBranding(request.LogoUrl, request.PrimaryColor);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
