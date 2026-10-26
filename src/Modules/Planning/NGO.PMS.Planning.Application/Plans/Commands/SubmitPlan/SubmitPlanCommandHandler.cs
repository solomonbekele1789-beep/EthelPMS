using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.SubmitPlan;

public class SubmitPlanCommandHandler : IRequestHandler<SubmitPlanCommand>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitPlanCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(SubmitPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.PlanEntries
            .FirstOrDefaultAsync(p => p.Id == request.PlanEntryId, ct)
            ?? throw new NotFoundException("Plan entry", request.PlanEntryId);

        plan.Submit(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
    }
}
