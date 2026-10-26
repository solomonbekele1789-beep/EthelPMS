using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application.DTOs;

namespace NGO.PMS.Planning.Application.Dip.Queries.ListDipItems;

public class ListDipItemsQueryHandler : IRequestHandler<ListDipItemsQuery, List<DipItemDto>>
{
    private readonly IPlanningDbContext _db;
    private readonly IMapper _mapper;

    public ListDipItemsQueryHandler(IPlanningDbContext db, IMapper mapper)
    { _db = db; _mapper = mapper; }

    public async Task<List<DipItemDto>> Handle(ListDipItemsQuery request, CancellationToken ct)
    {
        return await _db.DipItems
            .Where(d => d.ActivityId == request.ActivityId)
            .Include(d => d.Milestones)
            .OrderBy(d => d.SortOrder)
            .ProjectTo<DipItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
