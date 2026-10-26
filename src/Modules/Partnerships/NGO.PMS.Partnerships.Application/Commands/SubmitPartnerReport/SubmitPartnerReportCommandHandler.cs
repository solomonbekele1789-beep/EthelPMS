using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Partnerships.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Partnerships.Application.Commands.SubmitPartnerReport;

public sealed class SubmitPartnerReportCommandHandler : IRequestHandler<SubmitPartnerReportCommand, Unit>
{
    private readonly IPartnershipsDbContext _db;

    public SubmitPartnerReportCommandHandler(IPartnershipsDbContext db)
    { _db = db; }

    public async Task<Unit> Handle(SubmitPartnerReportCommand request, CancellationToken ct)
    {
        var entity = await _db.PartnerReports
            .FirstOrDefaultAsync(x => x.Id == request.Id, ct)
            ?? throw new NotFoundException(nameof(Domain.Entities.PartnerReport), request.Id);

        entity.Submit(request.Narrative, request.FinancialSummaryJson);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
