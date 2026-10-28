using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.AddPlanItem;

public sealed class AddPlanItemCommandHandler : IRequestHandler<AddPlanItemCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddPlanItemCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddPlanItemCommand request, CancellationToken ct)
    {
        var plan = await _db.ProcurementPlans
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Procurement plan not found.");

        var existingIds = plan.Items.Select(i => i.Id).ToHashSet();

        plan.AddItem(request.Description, request.EstimatedCost, request.Method, request.Quantity);

        var newItem = plan.Items.First(i => !existingIds.Contains(i.Id));
        newItem.Update(request.Description, request.EstimatedCost, request.Method, request.Quantity, request.Unit, request.PlannedQuarter);

        await _db.SaveChangesAsync(ct);
        return newItem.Id;
    }
}
