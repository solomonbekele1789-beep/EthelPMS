using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.UpdatePlanEntry;

public class UpdatePlanEntryCommandHandler : IRequestHandler<UpdatePlanEntryCommand>
{
    private readonly IPlanningDbContext _db;

    public UpdatePlanEntryCommandHandler(IPlanningDbContext db) => _db = db;

    public async Task Handle(UpdatePlanEntryCommand request, CancellationToken ct)
    {
        var plan = await _db.PlanEntries
            .FirstOrDefaultAsync(p => p.Id == request.PlanEntryId, ct)
            ?? throw new NotFoundException("Plan entry", request.PlanEntryId);

        plan.Update(request.Title, request.Description, request.PlannedStartDate, request.PlannedEndDate, request.PlannedBudget);
        await _db.SaveChangesAsync(ct);
    }
}
