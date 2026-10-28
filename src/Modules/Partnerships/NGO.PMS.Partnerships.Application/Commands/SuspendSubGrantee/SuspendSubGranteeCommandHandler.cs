using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.SuspendSubGrantee;

public sealed class SuspendSubGranteeCommandHandler : IRequestHandler<SuspendSubGranteeCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public SuspendSubGranteeCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(SuspendSubGranteeCommand request, CancellationToken ct)
    {
        var entity = await _db.SubGrantees
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.SubGrantee), request.Id);

        entity.Suspend("Suspended by administrator");
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
