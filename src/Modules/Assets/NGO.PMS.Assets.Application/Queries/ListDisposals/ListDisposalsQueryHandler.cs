using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Assets.Application.Abstractions;
using NGO.PMS.Assets.Application.DTOs;

namespace NGO.PMS.Assets.Application.Queries.ListDisposals;

public sealed class ListDisposalsQueryHandler : IRequestHandler<ListDisposalsQuery, PagedResult<AssetDisposalDto>>
{
    private readonly IAssetsDbContext _db;
    private readonly IMapper _mapper;

    public ListDisposalsQueryHandler(IAssetsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<AssetDisposalDto>> Handle(ListDisposalsQuery request, CancellationToken ct)
    {
        var query = _db.AssetDisposals.AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(d => d.Status == request.Status.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<AssetDisposalDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<AssetDisposalDto>(items, totalCount, request.Page, request.PageSize);
    }
}
