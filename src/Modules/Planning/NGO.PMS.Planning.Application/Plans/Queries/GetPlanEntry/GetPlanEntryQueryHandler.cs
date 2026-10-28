using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Planning.Application.Plans.Queries.GetPlanEntry;

public class GetPlanEntryQueryHandler : IRequestHandler<GetPlanEntryQuery, PlanEntryDto>
{
    private readonly IPlanningDbContext _db;
    private readonly IMapper _mapper;

    public GetPlanEntryQueryHandler(IPlanningDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<PlanEntryDto> Handle(GetPlanEntryQuery request, CancellationToken ct)
    {
        var plan = await _db.PlanEntries
            .Include(p => p.IndicatorAllocations)
            .Include(p => p.PlanActivities)
            .FirstOrDefaultAsync(p => p.Id == request.PlanEntryId, ct)
            ?? throw new NotFoundException("Plan entry", request.PlanEntryId);

        return _mapper.Map<PlanEntryDto>(plan);
    }
}
