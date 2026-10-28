using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Application.InterventionAreas.Queries.ListInterventionAreas;

public class ListInterventionAreasQueryHandler : IRequestHandler<ListInterventionAreasQuery, List<InterventionAreaDto>>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListInterventionAreasQueryHandler(IProjectsDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<List<InterventionAreaDto>> Handle(ListInterventionAreasQuery request, CancellationToken ct)
    {
        var rootAreas = await _db.InterventionAreas
            .AsNoTracking()
            .Where(ia => ia.OrganizationId == _currentUser.OrganizationId
                      && ia.ParentId == null
                      && ia.IsActive)
            .Include(ia => ia.Children.Where(c => c.IsActive))
                .ThenInclude(c => c.Children.Where(gc => gc.IsActive))
            .OrderBy(ia => ia.SortOrder)
                .ThenBy(ia => ia.Name)
            .ToListAsync(ct);

        return _mapper.Map<List<InterventionAreaDto>>(rootAreas);
    }
}
