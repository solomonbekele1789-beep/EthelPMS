using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Donors.Application.Abstractions;
using NGO.PMS.Donors.Application.DTOs;

namespace NGO.PMS.Donors.Application.Queries.ListDonors;

public sealed class ListDonorsQueryHandler : IRequestHandler<ListDonorsQuery, PagedResult<DonorDto>>
{
    private readonly IDonorsDbContext _db;
    private readonly IMapper _mapper;

    public ListDonorsQueryHandler(IDonorsDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<DonorDto>> Handle(ListDonorsQuery request, CancellationToken ct)
    {
        var query = _db.Donors.AsNoTracking().AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(d => d.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(d => d.Name.Contains(request.Search) ||
                (d.Acronym != null && d.Acronym.Contains(request.Search)));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<DonorDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<DonorDto>(items, totalCount, request.Page, request.PageSize);
    }
}
