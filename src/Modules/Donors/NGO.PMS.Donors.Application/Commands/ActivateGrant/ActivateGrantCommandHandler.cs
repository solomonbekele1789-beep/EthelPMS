using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Donors.Application.Commands.ActivateGrant;

public sealed class ActivateGrantCommandHandler : IRequestHandler<ActivateGrantCommand, Unit>
{
    private readonly IDonorsDbContext _db;

    public ActivateGrantCommandHandler(IDonorsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(ActivateGrantCommand request, CancellationToken ct)
    {
        var grant = await _db.Grants.FirstOrDefaultAsync(g => g.Id == request.GrantId, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Grant), request.GrantId);

        grant.Activate();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
