using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Roles.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Roles.Queries.ListRoles;

public class ListRolesQueryHandler : IRequestHandler<ListRolesQuery, PagedResponse<RoleListItemDto>>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;
    public ListRolesQueryHandler(IIdentityDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

    public async Task<PagedResponse<RoleListItemDto>> Handle(ListRolesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Roles.Include(r => r.RolePermissions).Include(r => r.UserRoles).AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(r => r.Name.ToLower().Contains(request.Search.ToLower()));

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(r => r.Name)
            .Skip((request.Page - 1) * request.PageSize).Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return PagedResponse<RoleListItemDto>.Ok(_mapper.Map<List<RoleListItemDto>>(items), request.Page, request.PageSize, total);
    }
}
