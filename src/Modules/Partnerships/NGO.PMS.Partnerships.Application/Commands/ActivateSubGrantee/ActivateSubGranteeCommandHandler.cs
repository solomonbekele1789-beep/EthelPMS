using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.ActivateSubGrantee;

public sealed class ActivateSubGranteeCommandHandler : IRequestHandler<ActivateSubGranteeCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public ActivateSubGranteeCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(ActivateSubGranteeCommand request, CancellationToken ct)
    {
        var entity = await _db.SubGrantees
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.SubGrantee), request.Id);

        entity.Activate();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
