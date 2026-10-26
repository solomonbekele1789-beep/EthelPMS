using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.RejectDisbursement;

public sealed class RejectDisbursementCommandHandler : IRequestHandler<RejectDisbursementCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public RejectDisbursementCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(RejectDisbursementCommand request, CancellationToken ct)
    {
        var entity = await _db.Disbursements
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Disbursement), request.Id);

        entity.Reject();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
