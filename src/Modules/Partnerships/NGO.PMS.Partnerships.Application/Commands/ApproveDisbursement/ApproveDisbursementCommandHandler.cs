using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.ApproveDisbursement;

public sealed class ApproveDisbursementCommandHandler : IRequestHandler<ApproveDisbursementCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApproveDisbursementCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(ApproveDisbursementCommand request, CancellationToken ct)
    {
        var entity = await _db.Disbursements
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Disbursement), request.Id);

        entity.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
