using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.AssessPartnerRisk;

public sealed class AssessPartnerRiskCommandHandler : IRequestHandler<AssessPartnerRiskCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public AssessPartnerRiskCommandHandler(IPartnershipsDbContext db) => _db = db;

    public async Task<Unit> Handle(AssessPartnerRiskCommand request, CancellationToken ct)
    {
        var entity = await _db.SubGrantees
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.SubGrantee), request.Id);

        entity.AssessRisk(request.RiskRating, request.CapacityScore);
        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
