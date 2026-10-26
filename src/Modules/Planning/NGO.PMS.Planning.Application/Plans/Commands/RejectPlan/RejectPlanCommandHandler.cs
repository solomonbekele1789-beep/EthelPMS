using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.RejectPlan;

public class RejectPlanCommandHandler : IRequestHandler<RejectPlanCommand>
{
    private readonly IPlanningDbContext _db;

    public RejectPlanCommandHandler(IPlanningDbContext db) => _db = db;

    public async Task Handle(RejectPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.PlanEntries
            .FirstOrDefaultAsync(p => p.Id == request.PlanEntryId, ct)
            ?? throw new NotFoundException("Plan entry", request.PlanEntryId);

        plan.Reject(request.Reason);
        await _db.SaveChangesAsync(ct);
    }
}
