using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.RequireComplianceFollowUp;

public sealed class RequireComplianceFollowUpCommandHandler : IRequestHandler<RequireComplianceFollowUpCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public RequireComplianceFollowUpCommandHandler(IPartnershipsDbContext db)
    { _db = db; }

    public async Task<Unit> Handle(RequireComplianceFollowUpCommand request, CancellationToken ct)
    {
        var entity = await _db.PartnerCompliances
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.PartnerCompliance), request.Id);

        entity.RequireFollowUp(request.FollowUpDate, request.Recommendations);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
