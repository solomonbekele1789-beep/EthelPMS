using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListAssets;

public sealed class ListAssetsQueryHandler : IRequestHandler<ListAssetsQuery, PagedResult<AssetDto>>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public ListAssetsQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<AssetDto>> Handle(ListAssetsQuery request, CancellationToken ct)
    {
        var query = _db.Assets.AsQueryable();

        if (request.CategoryId.HasValue)
            query = query.Where(a => a.AssetCategoryId == request.CategoryId.Value);

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(a => a.ProjectId == request.ProjectId.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(a => a.Name.Contains(request.Search) || a.AssetCode.Contains(request.Search));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<AssetDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<AssetDto>(items, totalCount, request.Page, request.PageSize);
    }
}
