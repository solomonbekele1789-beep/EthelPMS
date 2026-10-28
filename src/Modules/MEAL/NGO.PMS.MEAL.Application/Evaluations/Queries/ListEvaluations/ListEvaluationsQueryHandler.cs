using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.Evaluations.Queries.ListEvaluations;

public class ListEvaluationsQueryHandler : IRequestHandler<ListEvaluationsQuery, List<EvaluationDto>>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public ListEvaluationsQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<EvaluationDto>> Handle(ListEvaluationsQuery request, CancellationToken ct)
    {
        var query = _db.Evaluations.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(e => e.ProjectId == request.ProjectId.Value);
        if (request.Status.HasValue)
            query = query.Where(e => e.Status == request.Status.Value);

        return await query
            .OrderByDescending(e => e.CreatedAt)
            .ProjectTo<EvaluationDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
