using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.UpdateDashboard;

public sealed class UpdateDashboardCommandHandler : IRequestHandler<UpdateDashboardCommand, Unit>
{
    private readonly IDashboardsDbContext _db;

    public UpdateDashboardCommandHandler(IDashboardsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateDashboardCommand request, CancellationToken cancellationToken)
    {
        var dashboard = await _db.DashboardConfigs
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("DashboardConfig", request.Id);

        dashboard.Update(request.Name, request.Description, request.IsShared, request.LayoutJson);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
