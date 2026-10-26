using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.MEAL.Application.Abstractions;
using NGO.PMS.MEAL.Application.DTOs;

namespace NGO.PMS.MEAL.Application.MealPlans.Queries.ListMealPlans;

public class ListMealPlansQueryHandler : IRequestHandler<ListMealPlansQuery, PagedResult<MealPlanDto>>
{
    private readonly IMealDbContext _db;
    private readonly IMapper _mapper;

    public ListMealPlansQueryHandler(IMealDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<PagedResult<MealPlanDto>> Handle(ListMealPlansQuery request, CancellationToken ct)
    {
        var query = _db.MealPlans.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(mp => mp.ProjectId == request.ProjectId.Value);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(mp => mp.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<MealPlanDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<MealPlanDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
