using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Roles.DTOs;

namespace NGO.PMS.Identity.Application.Roles.Queries.ListPermissions;

public class ListPermissionsQueryHandler : IRequestHandler<ListPermissionsQuery, List<PermissionDto>>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;
    public ListPermissionsQueryHandler(IIdentityDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

    public async Task<List<PermissionDto>> Handle(ListPermissionsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.Permissions.AsQueryable();
        if (!string.IsNullOrWhiteSpace(request.Module))
            query = query.Where(p => p.Module == request.Module);

        var perms = await query.OrderBy(p => p.Module).ThenBy(p => p.Resource).ThenBy(p => p.Action)
            .ToListAsync(cancellationToken);
        return _mapper.Map<List<PermissionDto>>(perms);
    }
}
