using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.UpdateInterventionArea;

public class UpdateInterventionAreaCommandHandler : IRequestHandler<UpdateInterventionAreaCommand>
{
    private readonly IProjectsDbContext _db;

    public UpdateInterventionAreaCommandHandler(IProjectsDbContext db) => _db = db;

    public async Task Handle(UpdateInterventionAreaCommand request, CancellationToken ct)
    {
        var interventionArea = await _db.InterventionAreas
            .FirstOrDefaultAsync(ia => ia.Id == request.InterventionAreaId && !ia.IsDeleted, ct)
            ?? throw new NotFoundException("InterventionArea", request.InterventionAreaId);

        interventionArea.Update(
            name: request.Name,
            description: request.Description,
            sortOrder: request.SortOrder,
            areaType: request.AreaType,
            latitude: request.Latitude,
            longitude: request.Longitude,
            altitude: request.Altitude,
            accuracy: request.Accuracy,
            gpsSource: request.GpsSource,
            landmarkOrAddress: request.LandmarkOrAddress,
            isActive: request.IsActive
        );

        await _db.SaveChangesAsync(ct);
    }
}
