using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Application.Common;
using NGO.PMS.Projects.Application.DTOs;
using NGO.PMS.Projects.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Projects.Application.Projects.Queries.ListProjects;

public class ListProjectsQueryHandler : IRequestHandler<ListProjectsQuery, PagedResult<ProjectListItemDto>>
{
    private readonly IProjectsDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IMapper _mapper;

    public ListProjectsQueryHandler(IProjectsDbContext db, ICurrentUserService currentUser, IMapper mapper)
    { _db = db; _currentUser = currentUser; _mapper = mapper; }

    public async Task<PagedResult<ProjectListItemDto>> Handle(ListProjectsQuery request, CancellationToken ct)
    {
        var query = _db.Projects
            .AsNoTracking()
            .Where(p => p.OrganizationId == _currentUser.OrganizationId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLowerInvariant();
            query = query.Where(p =>
                p.Code.ToLower().Contains(search) ||
                p.Name.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(request.Status)
            && Enum.TryParse<ProjectStatus>(request.Status, ignoreCase: true, out var status))
        {
            query = query.Where(p => p.Status == status);
        }

        var totalCount = await query.CountAsync(ct);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectTo<ProjectListItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(ct);

        return new PagedResult<ProjectListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
