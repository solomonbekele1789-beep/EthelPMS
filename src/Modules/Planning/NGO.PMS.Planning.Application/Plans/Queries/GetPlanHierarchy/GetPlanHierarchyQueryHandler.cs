using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.Planning.Domain.Enums;

namespace NGO.PMS.Planning.Application.Plans.Queries.GetPlanHierarchy;

public class GetPlanHierarchyQueryHandler : IRequestHandler<GetPlanHierarchyQuery, List<PlanHierarchyDto>>
{
    private readonly IPlanningDbContext _db;
    private readonly IMapper _mapper;

    public GetPlanHierarchyQueryHandler(IPlanningDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<PlanHierarchyDto>> Handle(GetPlanHierarchyQuery request, CancellationToken ct)
    {
        var query = _db.PlanEntries
            .Where(p => p.ProjectId == request.ProjectId && p.Level == PlanLevel.Annual);

        if (request.FiscalYear.HasValue)
            query = query.Where(p => p.FiscalYear == request.FiscalYear.Value);

        var annualPlans = await query
            .Include(p => p.Children).ThenInclude(q => q.Children).ThenInclude(m => m.Children).ThenInclude(w => w.Children)
            .OrderBy(p => p.FiscalYear)
            .ToListAsync(ct);

        return _mapper.Map<List<PlanHierarchyDto>>(annualPlans);
    }
}
