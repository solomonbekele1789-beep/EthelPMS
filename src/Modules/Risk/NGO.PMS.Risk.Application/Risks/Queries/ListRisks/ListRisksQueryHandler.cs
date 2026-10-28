using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Risk.Application.Abstractions;
using NGO.PMS.Risk.Application.DTOs;

namespace NGO.PMS.Risk.Application.Risks.Queries.ListRisks;

public class ListRisksQueryHandler : IRequestHandler<ListRisksQuery, PagedResult<RiskDto>>
{
    private readonly IRiskDbContext _db;
    private readonly IMapper _mapper;

    public ListRisksQueryHandler(IRiskDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResult<RiskDto>> Handle(ListRisksQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Risks.AsQueryable();

        if (request.ProjectId.HasValue)
            query = query.Where(r => r.ProjectId == request.ProjectId.Value);

        if (request.Status.HasValue)
            query = query.Where(r => r.Status == request.Status.Value);

        if (request.CategoryId.HasValue)
            query = query.Where(r => r.RiskCategoryId == request.CategoryId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.RiskScore)
            .ThenByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<RiskDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<RiskDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
