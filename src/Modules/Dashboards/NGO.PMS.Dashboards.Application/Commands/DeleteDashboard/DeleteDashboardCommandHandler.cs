using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.DeleteDashboard;

public sealed class DeleteDashboardCommandHandler : IRequestHandler<DeleteDashboardCommand, Unit>
{
    private readonly IDashboardsDbContext _db;

    public DeleteDashboardCommandHandler(IDashboardsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(DeleteDashboardCommand request, CancellationToken cancellationToken)
    {
        var dashboard = await _db.DashboardConfigs
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("DashboardConfig", request.Id);

        // Soft delete handled by SoftDeleteInterceptor
        _db.DashboardConfigs.Remove(dashboard);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
