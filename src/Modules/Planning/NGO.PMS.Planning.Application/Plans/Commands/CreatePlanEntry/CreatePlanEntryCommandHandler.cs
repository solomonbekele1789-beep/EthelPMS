using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Commands.CreatePlanEntry;

public class CreatePlanEntryCommandHandler : IRequestHandler<CreatePlanEntryCommand, Guid>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreatePlanEntryCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreatePlanEntryCommand request, CancellationToken ct)
    {
        if (request.ParentId.HasValue)
        {
            var parent = await _db.PlanEntries
                .Include(p => p.Children)
                .FirstOrDefaultAsync(p => p.Id == request.ParentId.Value, ct)
                ?? throw new NotFoundException("Parent plan", request.ParentId.Value);

            parent.ValidateChildAddition(request.Level, parent.Children.Count);
            parent.ValidateChildDates(request.PlannedStartDate, request.PlannedEndDate);

            var totalChildBudget = await _db.PlanEntries
                .Where(p => p.ParentId == request.ParentId.Value && !p.IsDeleted)
                .SumAsync(p => p.PlannedBudget, ct);
            parent.ValidateChildBudget(request.PlannedBudget, totalChildBudget);
        }

        var plan = PlanEntry.Create(
            request.Level, request.Title, request.ProjectId, _currentUser.OrganizationId,
            request.PlannedStartDate, request.PlannedEndDate, request.PlannedBudget, request.ParentId);

        plan.SetPeriodDesignators(request.FiscalYear, request.Quarter, request.Month, request.WeekNumber, request.DayDate);

        if (request.Description is not null)
            plan.Update(request.Title, request.Description, request.PlannedStartDate, request.PlannedEndDate, request.PlannedBudget);

        _db.PlanEntries.Add(plan);
        await _db.SaveChangesAsync(ct);
        return plan.Id;
    }
}
