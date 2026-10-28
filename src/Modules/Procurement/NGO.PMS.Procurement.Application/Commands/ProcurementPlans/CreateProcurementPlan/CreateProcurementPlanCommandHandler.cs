using MediatR;
using NGO.PMS.Procurement.Application.Abstractions;
using NGO.PMS.Procurement.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Application.Commands.ProcurementPlans.CreateProcurementPlan;

public sealed class CreateProcurementPlanCommandHandler : IRequestHandler<CreateProcurementPlanCommand, Guid>
{
    private readonly IProcurementDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateProcurementPlanCommandHandler(IProcurementDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateProcurementPlanCommand request, CancellationToken ct)
    {
        var plan = ProcurementPlan.Create(request.Title, request.ProjectId, request.FiscalYear, _currentUser.OrganizationId);

        _db.ProcurementPlans.Add(plan);
        await _db.SaveChangesAsync(ct);
        return plan.Id;
    }
}
