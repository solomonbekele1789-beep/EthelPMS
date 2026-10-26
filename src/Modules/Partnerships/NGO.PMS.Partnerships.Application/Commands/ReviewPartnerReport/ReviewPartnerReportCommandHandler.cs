using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.ReviewPartnerReport;

public sealed class ReviewPartnerReportCommandHandler : IRequestHandler<ReviewPartnerReportCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ReviewPartnerReportCommandHandler(IPartnershipsDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(ReviewPartnerReportCommand request, CancellationToken ct)
    {
        var entity = await _db.PartnerReports
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.PartnerReport), request.Id);

        entity.Review(_currentUser.UserId, request.Status, request.ReviewComments);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
