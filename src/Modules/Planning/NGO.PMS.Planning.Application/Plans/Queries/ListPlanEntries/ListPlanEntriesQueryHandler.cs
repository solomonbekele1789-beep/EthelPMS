using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Application.Common;
using NGO.PMS.Planning.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Planning.Application.Plans.Queries.ListPlanEntries;

public class ListPlanEntriesQueryHandler : IRequestHandler<ListPlanEntriesQuery, PagedResult<PlanEntryListItemDto>>
{
    private readonly IPlanningDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListPlanEntriesQueryHandler(IPlanningDbContext db, ICurrentUserService currentUser, IMapper mapper)
    {
        _db = db;
        _currentUser = currentUser;
        _mapper = mapper;
    }

    public async Task<PagedResult<PlanEntryListItemDto>> Handle(ListPlanEntriesQuery request, CancellationToken ct)
    {
        var query = _db.PlanEntries
            .AsNoTracking()
            .Include(p => p.Children)
            .Where(p => p.OrganizationId == _currentUser.OrganizationId && !p.IsDeleted)
            .AsQueryable();

        if (request.ProjectId.HasValue && request.ProjectId.Value != Guid.Empty)
            query = query.Where(p => p.ProjectId == request.ProjectId.Value);

        if (request.Level.HasValue)
            query = query.Where(p => p.Level == request.Level.Value);

        if (request.ParentId.HasValue)
            query = query.Where(p => p.ParentId == request.ParentId.Value);

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderBy(p => p.PlannedStartDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<PlanEntryListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<PlanEntryListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
