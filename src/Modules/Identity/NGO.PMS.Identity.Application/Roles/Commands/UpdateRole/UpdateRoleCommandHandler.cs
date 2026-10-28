using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Commands.UpdateRole;

public class UpdateRoleCommandHandler : IRequestHandler<UpdateRoleCommand>
{
    private readonly IIdentityDbContext _db;
    public UpdateRoleCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _db.Roles.Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Role", request.Id);

        if (role.IsSystemRole) throw new BusinessRuleException("System roles cannot be modified.");

        role.Update(request.Name, request.Description);

        // Replace permissions
        role.RolePermissions.Clear();
        foreach (var permId in request.PermissionIds)
            role.RolePermissions.Add(new RolePermission { RoleId = role.Id, PermissionId = permId });

        await _db.SaveChangesAsync(cancellationToken);
    }
}
