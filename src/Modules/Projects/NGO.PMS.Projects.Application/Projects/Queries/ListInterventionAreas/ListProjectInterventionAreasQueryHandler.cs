using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListInterventionAreas;

public class ListProjectInterventionAreasQueryHandler : IRequestHandler<ListProjectInterventionAreasQuery, List<ProjectInterventionAreaDto>>
{
    private readonly IProjectsDbContext _db;
    private readonly IMapper _mapper;

    public ListProjectInterventionAreasQueryHandler(IProjectsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<ProjectInterventionAreaDto>> Handle(ListProjectInterventionAreasQuery request, CancellationToken ct)
    {
        var allocations = await _db.ProjectInterventionAreas
            .AsNoTracking()
            .Where(pia => pia.ProjectId == request.ProjectId)
            .Include(pia => pia.InterventionArea)
                .ThenInclude(ia => ia.Parent)
            .OrderBy(pia => pia.InterventionArea.Level)
                .ThenBy(pia => pia.InterventionArea.Name)
            .ToListAsync(ct);

        return _mapper.Map<List<ProjectInterventionAreaDto>>(allocations);
    }
}
