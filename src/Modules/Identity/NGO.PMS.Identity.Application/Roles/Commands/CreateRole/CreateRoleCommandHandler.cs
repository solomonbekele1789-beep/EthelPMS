using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Commands.CreateRole;

public class CreateRoleCommandHandler : IRequestHandler<CreateRoleCommand, Guid>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateRoleCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser)
    { _db = db; _currentUser = currentUser; }

    public async Task<Guid> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _db.Roles.AnyAsync(r => r.Name == request.Name && r.OrganizationId == _currentUser.OrganizationId, cancellationToken);
        if (nameExists) throw new BusinessRuleException($"A role named '{request.Name}' already exists.");

        var role = Role.Create(request.Name, request.Description, _currentUser.OrganizationId);

        foreach (var permId in request.PermissionIds)
        {
            if (!await _db.Permissions.AnyAsync(p => p.Id == permId, cancellationToken))
                throw new NotFoundException("Permission", permId);
            role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });
        }

        _db.Roles.Add(role);
        await _db.SaveChangesAsync(cancellationToken);
        return role.Id;
    }
}
