using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Projects.Application.ResultsFramework.Queries.GetLogframe;

public class GetLogframeQueryHandler : IRequestHandler<GetLogframeQuery, LogframeDto>
{
    private readonly IProjectsDbContext _db;
    private readonly IMapper _mapper;

    public GetLogframeQueryHandler(IProjectsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<LogframeDto> Handle(GetLogframeQuery request, CancellationToken ct)
    {
        var project = await _db.Projects
            .AsNoTracking()
            .Include(p => p.Outcomes)
                .ThenInclude(o => o.Indicators)
            .Include(p => p.Outcomes)
                .ThenInclude(o => o.Outputs)
                    .ThenInclude(op => op.Indicators)
            .Include(p => p.Outcomes)
                .ThenInclude(o => o.Outputs)
                    .ThenInclude(op => op.Activities)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, ct)
            ?? throw new NotFoundException("Project", request.ProjectId);

        return new LogframeDto
        {
            ProjectId = project.Id,
            ProjectCode = project.Code,
            ProjectName = project.Name,
            Outcomes = _mapper.Map<List<LogframeOutcomeDto>>(
                project.Outcomes.OrderBy(o => o.Code).ToList())
        };
    }
}
