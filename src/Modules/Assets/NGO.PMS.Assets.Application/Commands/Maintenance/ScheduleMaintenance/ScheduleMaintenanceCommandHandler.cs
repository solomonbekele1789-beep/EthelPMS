using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Assets.Application.Commands.Maintenance.ScheduleMaintenance;

public sealed class ScheduleMaintenanceCommandHandler : IRequestHandler<ScheduleMaintenanceCommand, Guid>
{
    private readonly IAssetsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ScheduleMaintenanceCommandHandler(IAssetsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(ScheduleMaintenanceCommand request, CancellationToken ct)
    {
        var assetExists = await _db.Assets.AnyAsync(a => a.Id == request.AssetId, ct);

        if (!assetExists)
            throw new NotFoundException(nameof(Asset), request.AssetId);

        var maintenance = AssetMaintenance.Create(
            request.AssetId,
            request.Description,
            request.ScheduledDate,
            _currentUser.OrganizationId);

        _db.AssetMaintenances.Add(maintenance);
        await _db.SaveChangesAsync(ct);
        return maintenance.Id;
    }
}
