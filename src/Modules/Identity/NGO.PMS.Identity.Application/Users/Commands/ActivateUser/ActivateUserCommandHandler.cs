using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Commands.ActivateUser;

public class ActivateUserCommandHandler : IRequestHandler<ActivateUserCommand>
{
    private readonly IIdentityDbContext _db;
    public ActivateUserCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(ActivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);
        user.Activate();
        await _db.SaveChangesAsync(cancellationToken);
    }
}
