using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.RemoveWidget;

public sealed class RemoveWidgetCommandHandler : IRequestHandler<RemoveWidgetCommand, Unit>
{
    private readonly IDashboardsDbContext _db;

    public RemoveWidgetCommandHandler(IDashboardsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(RemoveWidgetCommand request, CancellationToken cancellationToken)
    {
        var widget = await _db.DashboardWidgets
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("DashboardWidget", request.Id);

        _db.DashboardWidgets.Remove(widget);
        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
