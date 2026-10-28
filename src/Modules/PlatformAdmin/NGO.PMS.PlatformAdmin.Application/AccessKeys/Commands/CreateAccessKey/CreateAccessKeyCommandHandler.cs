using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.CreateAccessKey;

public class CreateAccessKeyCommandHandler : IRequestHandler<CreateAccessKeyCommand, string>
{
    private readonly IPlatformDbContext _db;

    public CreateAccessKeyCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task<string> Handle(CreateAccessKeyCommand request, CancellationToken cancellationToken)
    {
        var tenantExists = await _db.Tenants
            .AnyAsync(t => t.Id == request.TenantId, cancellationToken);

        if (!tenantExists)
            throw new NotFoundException("Tenant", request.TenantId);

        var rawKey = TenantAccessKey.GenerateKey();
        var keyHash = TenantAccessKey.HashKey(rawKey);

        var accessKey = new TenantAccessKey
        {
            TenantId = request.TenantId,
            KeyHash = keyHash,
            Label = request.Label,
            Scopes = request.Scopes,
            ExpiresAt = request.ExpiresAt
        };

        _db.AccessKeys.Add(accessKey);
        await _db.SaveChangesAsync(cancellationToken);

        return rawKey;
    }
}
