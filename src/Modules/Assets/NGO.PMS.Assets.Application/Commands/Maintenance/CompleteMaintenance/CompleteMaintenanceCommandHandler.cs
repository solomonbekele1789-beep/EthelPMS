using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Maintenance.CompleteMaintenance;

public sealed class CompleteMaintenanceCommandHandler : IRequestHandler<CompleteMaintenanceCommand, Unit>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CompleteMaintenanceCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(CompleteMaintenanceCommand request, CancellationToken ct)
    {
        var maintenance = await _db.AssetMaintenances
            .FirstOrDefaultAsync(m => m.Id == request.MaintenanceId, ct);

        if (maintenance is null)
            throw new NotFoundException(nameof(AssetMaintenance), request.MaintenanceId);

        maintenance.Complete(
            request.CompletedDate,
            request.Cost,
            request.PerformedBy,
            request.Notes,
            request.NextScheduledDate);

        await _db.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
