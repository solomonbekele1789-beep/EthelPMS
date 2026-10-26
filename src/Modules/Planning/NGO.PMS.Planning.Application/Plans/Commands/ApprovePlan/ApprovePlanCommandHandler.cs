using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.ApprovePlan;

public class ApprovePlanCommandHandler : IRequestHandler<ApprovePlanCommand>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ApprovePlanCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(ApprovePlanCommand request, CancellationToken ct)
    {
        var plan = await _db.PlanEntries
            .FirstOrDefaultAsync(p => p.Id == request.PlanEntryId, ct)
            ?? throw new NotFoundException("Plan entry", request.PlanEntryId);

        plan.Approve(_currentUser.UserId);
        await _db.SaveChangesAsync(ct);
    }
}
