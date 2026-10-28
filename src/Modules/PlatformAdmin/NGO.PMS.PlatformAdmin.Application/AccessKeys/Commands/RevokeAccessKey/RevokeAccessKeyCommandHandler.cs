using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Application.AccessKeys.Commands.RevokeAccessKey;

public class RevokeAccessKeyCommandHandler : IRequestHandler<RevokeAccessKeyCommand>
{
    private readonly IPlatformDbContext _db;

    public RevokeAccessKeyCommandHandler(IPlatformDbContext db) => _db = db;

    public async Task Handle(RevokeAccessKeyCommand request, CancellationToken cancellationToken)
    {
        var key = await _db.AccessKeys
            .FirstOrDefaultAsync(k => k.Id == request.KeyId, cancellationToken)
            ?? throw new NotFoundException("AccessKey", request.KeyId);

        key.Revoke();

        await _db.SaveChangesAsync(cancellationToken);
    }
}
