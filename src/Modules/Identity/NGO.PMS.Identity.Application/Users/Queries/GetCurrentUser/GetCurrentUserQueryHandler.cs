using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Users.DTOs;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, CurrentUserDto>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCurrentUserQueryHandler(IIdentityDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<CurrentUserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("User", _currentUser.UserId);

        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == _currentUser.OrganizationId, cancellationToken);

        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        return new CurrentUserDto(
            user.Id, user.Email, user.FirstName, user.LastName,
            _currentUser.OrganizationId, org?.Name ?? "", permissions, roles);
    }
}
