using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Commands.DeleteRole;

public class DeleteRoleCommandHandler : IRequestHandler<DeleteRoleCommand>
{
    private readonly IIdentityDbContext _db;
    public DeleteRoleCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await _db.Roles.Include(r => r.UserRoles)
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Role", request.Id);

        if (role.IsSystemRole) throw new BusinessRuleException("System roles cannot be deleted.");
        if (role.UserRoles.Count > 0) throw new BusinessRuleException("Cannot delete a role that is assigned to users. Remove all assignments first.");

        _db.Roles.Remove(role); // SoftDeleteInterceptor will handle
        await _db.SaveChangesAsync(cancellationToken);
    }
}
