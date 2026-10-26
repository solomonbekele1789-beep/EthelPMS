using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListAssetCategories;

internal sealed class ListAssetCategoriesQueryHandler
    : IRequestHandler<ListAssetCategoriesQuery, List<AssetCategoryDto>>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public ListAssetCategoriesQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<List<AssetCategoryDto>> Handle(
        ListAssetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.AssetCategories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(c =>
                c.Name.Contains(request.Search) || c.Code.Contains(request.Search));

        return await query
            .OrderBy(c => c.Name)
            .ProjectTo<AssetCategoryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
