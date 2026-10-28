using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.DTOs;

namespace NGO.PMS.Projects.Application.ResultsFramework.Queries.ListOutcomes;

public class ListOutcomesQueryHandler : IRequestHandler<ListOutcomesQuery, List<OutcomeDto>>
{
    private readonly IProjectsDbContext _db;
    private readonly IMapper _mapper;

    public ListOutcomesQueryHandler(IProjectsDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<OutcomeDto>> Handle(ListOutcomesQuery request, CancellationToken ct)
    {
        var outcomes = await _db.Outcomes
            .AsNoTracking()
            .Where(o => o.ProjectId == request.ProjectId)
            .Include(o => o.Outputs)
            .Include(o => o.Indicators)
            .OrderBy(o => o.Code)
            .ToListAsync(ct);

        return _mapper.Map<List<OutcomeDto>>(outcomes);
    }
}
