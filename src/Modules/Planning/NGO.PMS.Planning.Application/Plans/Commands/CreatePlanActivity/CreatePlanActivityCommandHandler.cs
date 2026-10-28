using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.CreatePlanActivity;

public class CreatePlanActivityCommandHandler : IRequestHandler<CreatePlanActivityCommand, Guid>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePlanActivityCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePlanActivityCommand request, CancellationToken ct)
    {
        var planExists = await _db.PlanEntries.AnyAsync(p => p.Id == request.PlanEntryId, ct);
        if (!planExists) throw new NotFoundException("Plan entry", request.PlanEntryId);

        var activity = PlanActivity.Create(request.PlanEntryId, request.PlannedBudget, _currentUser.OrganizationId);
        activity.ResponsibleUserId = request.ResponsibleUserId;

        if (request.OutcomeId.HasValue) activity.LinkToOutcome(request.OutcomeId.Value);
        else if (request.OutputId.HasValue) activity.LinkToOutput(request.OutputId.Value);
        else if (request.ActivityId.HasValue) activity.LinkToActivity(request.ActivityId.Value);

        _db.PlanActivities.Add(activity);
        await _db.SaveChangesAsync(ct);
        return activity.Id;
    }
}
