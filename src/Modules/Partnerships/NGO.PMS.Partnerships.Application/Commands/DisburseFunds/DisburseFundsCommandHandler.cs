using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.DisburseFunds;

public sealed class DisburseFundsCommandHandler : IRequestHandler<DisburseFundsCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public DisburseFundsCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(DisburseFundsCommand request, CancellationToken ct)
    {
        var entity = await _db.Disbursements
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.Disbursement), request.Id);

        entity.Disburse();
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
