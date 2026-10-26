using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.AddWidget;

public sealed class AddWidgetCommandHandler : IRequestHandler<AddWidgetCommand, Guid>
{
    private readonly IDashboardsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddWidgetCommandHandler(IDashboardsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddWidgetCommand request, CancellationToken cancellationToken)
    {
        var dashboardExists = await _db.DashboardConfigs
            .AnyAsync(d => d.Id == request.DashboardConfigId, cancellationToken);

        if (!dashboardExists)
            throw new NotFoundException("DashboardConfig", request.DashboardConfigId);

        var widget = DashboardWidget.Create(
            _currentUser.OrganizationId,
            request.DashboardConfigId,
            request.WidgetType,
            request.Title,
            request.DataSourceModule,
            request.QueryDefinition,
            request.DisplayConfig,
            request.Position,
            request.Width,
            request.Height,
            request.RefreshIntervalMinutes);

        _db.DashboardWidgets.Add(widget);
        await _db.SaveChangesAsync(cancellationToken);

        return widget.Id;
    }
}
