using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Application.InterventionAreas.Queries.ListInterventionAreas;

public class ListInterventionAreasQueryHandler : IRequestHandler<ListInterventionAreasQuery, List<InterventionAreaDto>>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ListInterventionAreasQueryHandler(IProjectsDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<InterventionAreaDto>> Handle(ListInterventionAreasQuery request, CancellationToken ct)
    {
        var allAreas = await _db.InterventionAreas
            .AsNoTracking()
            .Where(ia => ia.OrganizationId == _currentUser.OrganizationId && !ia.IsDeleted)
            .Include(ia => ia.Parent)
            .OrderBy(ia => ia.Level)
                .ThenBy(ia => ia.SortOrder)
                .ThenBy(ia => ia.Name)
            .ToListAsync(ct);

        var dtoList = allAreas.Select(a => new InterventionAreaDto
        {
            Id = a.Id,
            Name = a.Name,
            Code = a.Code,
            AreaType = a.AreaType,
            Description = a.Description,
            Level = a.Level,
            SortOrder = a.SortOrder,
            IsActive = a.IsActive,
            Latitude = a.Latitude,
            Longitude = a.Longitude,
            Altitude = a.Altitude,
            Accuracy = a.Accuracy,
            GpsSource = a.GpsSource,
            LandmarkOrAddress = a.LandmarkOrAddress,
            ParentId = a.ParentId,
            ParentName = a.Parent?.Name,
            Children = []
        }).ToList();

        if (request.Flat)
        {
            return dtoList;
        }

        // Build hierarchical tree
        var lookup = dtoList.ToDictionary(x => x.Id);
        var roots = new List<InterventionAreaDto>();

        foreach (var item in dtoList)
        {
            if (item.ParentId.HasValue && lookup.TryGetValue(item.ParentId.Value, out var parent))
            {
                parent.Children.Add(item);
            }
            else
            {
                roots.Add(item);
            }
        }

        return roots;
    }
}
