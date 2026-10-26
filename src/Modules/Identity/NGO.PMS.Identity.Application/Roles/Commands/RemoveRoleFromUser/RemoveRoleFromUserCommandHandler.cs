using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Commands.RemoveRoleFromUser;

public class RemoveRoleFromUserCommandHandler : IRequestHandler<RemoveRoleFromUserCommand>
{
    private readonly IIdentityDbContext _db;

    public RemoveRoleFromUserCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(RemoveRoleFromUserCommand request, CancellationToken cancellationToken)
    {
        var userRole = await _db.UserRoles
            .FirstOrDefaultAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId, cancellationToken)
            ?? throw new NotFoundException("UserRole", $"UserId={request.UserId}, RoleId={request.RoleId}");

        // Ensure user keeps at least one role
        var roleCount = await _db.UserRoles.CountAsync(ur => ur.UserId == request.UserId, cancellationToken);
        if (roleCount <= 1)
            throw new BusinessRuleException("A user must have at least one role assigned.");

        _db.UserRoles.Remove(userRole);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
