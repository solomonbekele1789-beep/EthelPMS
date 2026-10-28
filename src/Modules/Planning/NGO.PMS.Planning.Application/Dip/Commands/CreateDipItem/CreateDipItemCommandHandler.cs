using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Dip.Commands.CreateDipItem;

public class CreateDipItemCommandHandler : IRequestHandler<CreateDipItemCommand, Guid>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDipItemCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateDipItemCommand request, CancellationToken ct)
    {
        // Validate total DIP budget doesn't exceed parent activity budget (cross-module check deferred to integration)
        var totalExistingBudget = await _db.DipItems
            .Where(d => d.ActivityId == request.ActivityId && !d.IsDeleted)
            .SumAsync(d => d.BudgetAllocated, ct);

        var dip = DipItem.Create(
            request.ActivityId, request.ProjectId, request.Title,
            request.PlannedStartDate, request.PlannedEndDate,
            request.BudgetAllocated, _currentUser.OrganizationId, request.SortOrder);

        if (request.Description is not null)
            dip.Update(request.Title, request.Description, request.PlannedStartDate, request.PlannedEndDate, request.BudgetAllocated, request.SortOrder);

        dip.ResponsibleUserId = request.ResponsibleUserId;

        _db.DipItems.Add(dip);
        await _db.SaveChangesAsync(ct);
        return dip.Id;
    }
}
