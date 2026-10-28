using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.ListGrants;

public sealed class ListGrantsQueryHandler : IRequestHandler<ListGrantsQuery, PagedResult<GrantDto>>
{
    private readonly IDonorsDbContext _db;
    private readonly IMapper _mapper;

    public ListGrantsQueryHandler(IDonorsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<GrantDto>> Handle(ListGrantsQuery request, CancellationToken ct)
    {
        var query = _db.Grants.AsNoTracking().AsQueryable();

        if (request.DonorId.HasValue)
            query = query.Where(g => g.DonorId == request.DonorId.Value);

        if (request.Status.HasValue)
            query = query.Where(g => g.Status == request.Status.Value);

        if (request.ProjectId.HasValue)
            query = query.Where(g => g.ProjectId == request.ProjectId.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<GrantDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<GrantDto>(items, totalCount, request.Page, request.PageSize);
    }
}
