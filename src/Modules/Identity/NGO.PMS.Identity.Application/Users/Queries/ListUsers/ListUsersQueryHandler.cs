using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Users.DTOs;
using NGO.PMS.SharedKernel.Api;

namespace NGO.PMS.Identity.Application.Users.Queries.ListUsers;

public class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, PagedResponse<UserListItemDto>>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;

    public ListUsersQueryHandler(IIdentityDbContext db, IMapper mapper)
    {
        _db = db;
        _mapper = mapper;
    }

    public async Task<PagedResponse<UserListItemDto>> Handle(ListUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Users
            .Include(u => u.Office)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLowerInvariant();
            query = query.Where(u =>
                u.Email.Contains(search) ||
                u.FirstName.ToLower().Contains(search) ||
                u.LastName.ToLower().Contains(search));
        }

        if (request.OfficeId.HasValue)
            query = query.Where(u => u.OfficeId == request.OfficeId);

        if (request.IsActive.HasValue)
            query = query.Where(u => u.IsActive == request.IsActive);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(u => u.FirstName).ThenBy(u => u.LastName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<UserListItemDto>>(items);

        return PagedResponse<UserListItemDto>.Ok(dtos, request.Page, request.PageSize, totalCount);
    }
}
