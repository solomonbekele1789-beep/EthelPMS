using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Commands.UpdateActivity;

public class UpdateActivityCommandHandler : IRequestHandler<UpdateActivityCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateActivityCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateActivityCommand request, CancellationToken ct)
    {
        var activity = await _db.Activities
            .FirstOrDefaultAsync(a => a.Id == request.ActivityId, ct)
            ?? throw new NotFoundException("Activity", request.ActivityId);

        activity.Update(request.Name, request.Description, request.Unit,
            request.LifetimeTarget, request.BudgetAllocated,
            request.PlannedStartDate, request.PlannedEndDate, request.Assumptions);

        await _db.SaveChangesAsync(ct);
    }
}
