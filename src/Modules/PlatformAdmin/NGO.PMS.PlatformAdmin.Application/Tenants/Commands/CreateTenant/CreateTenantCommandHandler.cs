using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.Tenants.Commands.CreateTenant;

public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, Guid>
{
    private readonly IPlatformDbContext _db;

    public CreateTenantCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task<Guid> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
    {
        var slugExists = await _db.Tenants
            .AnyAsync(t => t.Slug == request.Slug.ToLowerInvariant().Trim(), cancellationToken);

        if (slugExists)
            throw new BusinessRuleException($"A tenant with slug '{request.Slug}' already exists.");

        var packageExists = await _db.SubscriptionPackages
            .AnyAsync(p => p.Id == request.SubscriptionPackageId, cancellationToken);

        if (!packageExists)
            throw new NotFoundException("SubscriptionPackage", request.SubscriptionPackageId);

        var tenant = PlatformTenant.Create(
            request.Name,
            request.Slug,
            request.AdminEmail,
            request.SubscriptionPackageId);

        _db.Tenants.Add(tenant);
        await _db.SaveChangesAsync(cancellationToken);

        return tenant.Id;
    }
}
