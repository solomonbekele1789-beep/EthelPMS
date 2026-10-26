using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.PlatformAdmin.Domain.Events;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;

public class ToggleModuleCommandHandler : IRequestHandler<ToggleModuleCommand>
{
    private readonly IPlatformDbContext _db;

    public ToggleModuleCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(ToggleModuleCommand request, CancellationToken cancellationToken)
    {
        if (!PlatformModules.IsValid(request.ModuleName))
            throw new BusinessRuleException($"'{request.ModuleName}' is not a valid platform module.");

        var tenant = await _db.Tenants
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        var module = await _db.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == request.TenantId && m.ModuleName == request.ModuleName, cancellationToken);

        if (module is null)
        {
            module = new TenantModule
            {
                TenantId = request.TenantId,
                ModuleName = request.ModuleName,
                IsEnabled = request.Enabled,
                EnabledAt = request.Enabled ? DateTimeOffset.UtcNow : null,
                DisabledAt = request.Enabled ? null : DateTimeOffset.UtcNow
            };
            _db.TenantModules.Add(module);
        }
        else
        {
            module.IsEnabled = request.Enabled;
            if (request.Enabled)
            {
                module.EnabledAt = DateTimeOffset.UtcNow;
                module.DisabledAt = null;
            }
            else
            {
                module.DisabledAt = DateTimeOffset.UtcNow;
            }
        }

        tenant.AddDomainEvent(new TenantModuleToggledEvent(request.TenantId, request.ModuleName, request.Enabled));
        await _db.SaveChangesAsync(cancellationToken);
    }
}
