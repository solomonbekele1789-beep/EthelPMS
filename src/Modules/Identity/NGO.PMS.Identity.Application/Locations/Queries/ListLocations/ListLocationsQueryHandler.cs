using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Locations.DTOs;

namespace NGO.PMS.Identity.Application.Locations.Queries.ListLocations;

public class ListLocationsQueryHandler : IRequestHandler<ListLocationsQuery, List<LocationDto>>
{
    private readonly IIdentityDbContext _db;
    public ListLocationsQueryHandler(IIdentityDbContext db) => _db = db;

    public async Task<List<LocationDto>> Handle(ListLocationsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Locations.Where(l => l.Level == request.Level);
        if (request.ParentId.HasValue)
            query = query.Where(l => l.ParentId == request.ParentId);

        return await query.OrderBy(l => l.Name)
            .Select(l => new LocationDto(l.Id, l.Name, l.NameAm, l.Level.ToString(), l.ParentId))
            .ToListAsync(cancellationToken);
    }
}
