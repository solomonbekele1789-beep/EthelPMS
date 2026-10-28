using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.SubmitProcurementPlan;

public sealed class SubmitProcurementPlanCommandHandler : IRequestHandler<SubmitProcurementPlanCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SubmitProcurementPlanCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(SubmitProcurementPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.ProcurementPlans
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Procurement plan not found.");

        plan.Submit();

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
