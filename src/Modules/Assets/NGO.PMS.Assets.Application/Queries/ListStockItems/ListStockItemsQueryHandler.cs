using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListStockItems;

public sealed class ListStockItemsQueryHandler : IRequestHandler<ListStockItemsQuery, List<StockItemDto>>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public ListStockItemsQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<StockItemDto>> Handle(ListStockItemsQuery request, CancellationToken ct)
    {
        var query = _db.StockItems.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(s => s.Category == request.Category);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(s => s.Name.Contains(request.Search) || s.ItemCode.Contains(request.Search));

        return await query
            .OrderBy(s => s.Name)
            .ProjectTo<StockItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);
    }
}
