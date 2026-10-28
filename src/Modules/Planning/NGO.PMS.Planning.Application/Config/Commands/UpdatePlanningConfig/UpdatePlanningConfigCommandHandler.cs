using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Application.Config.Commands.UpdatePlanningConfig;

public class UpdatePlanningConfigCommandHandler : IRequestHandler<UpdatePlanningConfigCommand>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdatePlanningConfigCommandHandler(IPlanningDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task Handle(UpdatePlanningConfigCommand request, CancellationToken ct)
    {
        var config = await _db.PlanningConfigurations
            .FirstOrDefaultAsync(c => c.OrganizationId == _currentUser.OrganizationId, ct);

        if (config is null)
        {
            config = PlanningConfiguration.CreateDefault(_currentUser.OrganizationId);
            _db.PlanningConfigurations.Add(config);
        }

        config.Update(request.EnableAnnualPlanning, request.EnableQuarterlyPlanning,
            request.EnableMonthlyPlanning, request.EnableWeeklyPlanning, request.EnableDailyPlanning,
            request.FiscalYearStartMonth, request.DefaultApprovalRequired);

        await _db.SaveChangesAsync(ct);
    }
}
