using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Roles.DTOs;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Queries.GetRole;

public class GetRoleQueryHandler : IRequestHandler<GetRoleQuery, RoleDto>
{
    private readonly IIdentityDbContext _db;
    private readonly IMapper _mapper;
    public GetRoleQueryHandler(IIdentityDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

    public async Task<RoleDto> Handle(GetRoleQuery request, CancellationToken cancellationToken)
    {
        var role = await _db.Roles
            .Include(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Role", request.Id);
        return _mapper.Map<RoleDto>(role);
    }
}
