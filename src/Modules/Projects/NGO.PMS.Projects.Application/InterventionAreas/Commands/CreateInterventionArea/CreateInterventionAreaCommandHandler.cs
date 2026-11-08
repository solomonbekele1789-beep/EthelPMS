using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.InterventionAreas.Commands.CreateInterventionArea;

public class CreateInterventionAreaCommandHandler : IRequestHandler<CreateInterventionAreaCommand, Guid>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateInterventionAreaCommandHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateInterventionAreaCommand request, CancellationToken ct)
    {
        var codeExists = await _db.InterventionAreas
            .AnyAsync(ia => ia.Code == request.Code.Trim()
                         && ia.OrganizationId == _currentUser.OrganizationId
                         && !ia.IsDeleted, ct);
        if (codeExists)
            throw new BusinessRuleException($"An intervention area with code '{request.Code}' already exists.");

        var level = 0;
        var areaType = string.IsNullOrWhiteSpace(request.AreaType) ? "Region" : request.AreaType.Trim();
        if (request.ParentId is not null)
        {
            var parent = await _db.InterventionAreas
                .FirstOrDefaultAsync(ia => ia.Id == request.ParentId.Value && !ia.IsDeleted, ct)
                ?? throw new NotFoundException("InterventionArea (parent)", request.ParentId.Value);

            level = parent.Level + 1;
        }

        var interventionArea = InterventionArea.Create(
            name: request.Name,
            code: request.Code,
            orgId: _currentUser.OrganizationId,
            areaType: areaType,
            parentId: request.ParentId,
            level: level,
            latitude: request.Latitude,
            longitude: request.Longitude,
            altitude: request.Altitude,
            accuracy: request.Accuracy,
            gpsSource: request.GpsSource,
            landmarkOrAddress: request.LandmarkOrAddress,
            description: request.Description
        );

        _db.InterventionAreas.Add(interventionArea);
        await _db.SaveChangesAsync(ct);
        return interventionArea.Id;
    }
}
