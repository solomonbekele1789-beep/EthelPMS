using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Domain.Events;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Roles.Commands.AssignRoleToUser;

public class AssignRoleToUserCommandHandler : IRequestHandler<AssignRoleToUserCommand>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AssignRoleToUserCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task Handle(AssignRoleToUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new NotFoundException("User", request.UserId);

        var role = await _db.Roles
            .FirstOrDefaultAsync(r => r.Id == request.RoleId, cancellationToken)
            ?? throw new NotFoundException("Role", request.RoleId);

        var alreadyAssigned = await _db.UserRoles
            .AnyAsync(ur => ur.UserId == request.UserId && ur.RoleId == request.RoleId, cancellationToken);

        if (alreadyAssigned)
            throw new BusinessRuleException($"Role '{role.Name}' is already assigned to this user.");

        _db.UserRoles.Add(new UserRole
        {
            UserId = request.UserId,
            RoleId = request.RoleId,
            AssignedBy = _currentUser.UserId
        });

        user.AddDomainEvent(new RoleAssignedEvent(request.UserId, request.RoleId));
        await _db.SaveChangesAsync(cancellationToken);
    }
}
