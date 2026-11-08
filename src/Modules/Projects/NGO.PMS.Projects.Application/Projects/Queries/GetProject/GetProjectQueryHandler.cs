using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.Projects.Queries.GetProject;

public class GetProjectQueryHandler : IRequestHandler<GetProjectQuery, ProjectDto>
{
    private readonly IProjectsDbContext _db;
    private readonly IMapper _mapper;

    public GetProjectQueryHandler(IProjectsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<ProjectDto> Handle(GetProjectQuery request, CancellationToken ct)
    {
        var project = await _db.Projects
            .AsNoTracking()
            .Include(p => p.TeamMembers)
            .Include(p => p.InterventionAreas)
                .ThenInclude(pia => pia.InterventionArea)
                    .ThenInclude(ia => ia.Parent)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        return _mapper.Map<ProjectDto>(project);
    }
}
