using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.RejectProcurementPlan;

public sealed class RejectProcurementPlanCommandHandler : IRequestHandler<RejectProcurementPlanCommand, Unit>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RejectProcurementPlanCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Unit> Handle(RejectProcurementPlanCommand request, CancellationToken ct)
    {
        var plan = await _db.ProcurementPlans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.OrganizationId == _currentUser.OrganizationId, ct)
            ?? throw new BusinessRuleException("Procurement plan not found.");

        plan.Reject(request.Reason);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
