using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.UpdateSubscription;

public class UpdateSubscriptionCommandHandler : IRequestHandler<UpdateSubscriptionCommand>
{
    private readonly IPlatformDbContext _db;

    public UpdateSubscriptionCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(UpdateSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants
            .Include(t => t.TenantModules)
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Tenant", request.TenantId);

        var package = await _db.SubscriptionPackages
            .FirstOrDefaultAsync(p => p.Id == request.SubscriptionPackageId, cancellationToken)
            ?? throw new NotFoundException("SubscriptionPackage", request.SubscriptionPackageId);

        tenant.ChangeSubscription(package.Id, package.MaxUsers, package.MaxProjects);

        // Auto-toggle modules based on the new package tier
        if (PlatformModules.TierDefaults.TryGetValue(package.Name, out var defaultModules))
        {
            foreach (var existing in tenant.TenantModules)
            {
                existing.IsEnabled = defaultModules.Contains(existing.ModuleName);
                if (existing.IsEnabled)
                {
                    existing.EnabledAt = DateTimeOffset.UtcNow;
                    existing.DisabledAt = null;
                }
                else
                {
                    existing.DisabledAt = DateTimeOffset.UtcNow;
                }
            }

            // Add any new modules not yet tracked
            var trackedModules = tenant.TenantModules.Select(m => m.ModuleName).ToHashSet();
            foreach (var moduleName in defaultModules.Where(m => !trackedModules.Contains(m)))
            {
                _db.TenantModules.Add(new TenantModule
                {
                    TenantId = tenant.Id,
                    ModuleName = moduleName,
                    IsEnabled = true,
                    EnabledAt = DateTimeOffset.UtcNow
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
