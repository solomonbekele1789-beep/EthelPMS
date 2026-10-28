using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.CompleteComplianceCheck;

public sealed class CompleteComplianceCheckCommandHandler : IRequestHandler<CompleteComplianceCheckCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public CompleteComplianceCheckCommandHandler(IPartnershipsDbContext db)
    { _db = db; }

    public async Task<Unit> Handle(CompleteComplianceCheckCommand request, CancellationToken ct)
    {
        var entity = await _db.PartnerCompliances
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.PartnerCompliance), request.Id);

        entity.Complete(request.Score, request.Findings);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
