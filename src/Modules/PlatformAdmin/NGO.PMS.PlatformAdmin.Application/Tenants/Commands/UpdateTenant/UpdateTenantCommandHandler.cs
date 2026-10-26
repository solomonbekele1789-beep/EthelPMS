using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateTenant;

public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand>
{
    private readonly IPlatformDbContext _db;

    public UpdateTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        tenant.Update(request.Name, request.MaxUsers, request.MaxProjects, request.Timezone);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
