using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Application.Abstractions;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Dashboards.Application.Commands.UpdateWidget;

public sealed class UpdateWidgetCommandHandler : IRequestHandler<UpdateWidgetCommand, Unit>
{
    private readonly IDashboardsDbContext _db;

    public UpdateWidgetCommandHandler(IDashboardsDbContext db)
    {
        _db = db;
    }

    public async Task<Unit> Handle(UpdateWidgetCommand request, CancellationToken cancellationToken)
    {
        var widget = await _db.DashboardWidgets
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("DashboardWidget", request.Id);

        widget.Update(
            request.Title,
            request.QueryDefinition,
            request.DisplayConfig,
            request.Position,
            request.Width,
            request.Height);

        await _db.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
