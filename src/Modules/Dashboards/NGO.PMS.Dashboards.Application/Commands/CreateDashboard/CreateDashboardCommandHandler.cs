using MediatR;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Dashboards.Application.Commands.CreateDashboard;

public sealed class CreateDashboardCommandHandler : IRequestHandler<CreateDashboardCommand, Guid>
{
    private readonly IDashboardsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateDashboardCommandHandler(IDashboardsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateDashboardCommand request, CancellationToken cancellationToken)
    {
        var dashboard = DashboardConfig.Create(
            _currentUser.OrganizationId,
            request.Name,
            request.DashboardType,
            request.Description,
            _currentUser.UserId,
            request.IsShared,
            request.LayoutJson);

        _db.DashboardConfigs.Add(dashboard);
        await _db.SaveChangesAsync(cancellationToken);

        return dashboard.Id;
    }
}
