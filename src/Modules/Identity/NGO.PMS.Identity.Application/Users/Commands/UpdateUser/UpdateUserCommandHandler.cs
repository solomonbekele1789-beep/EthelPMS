using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IIdentityDbContext _db;

    public UpdateUserCommandHandler(IIdentityDbContext db) => _db = db;

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        user.UpdateProfile(request.FirstName, request.LastName, request.Phone, request.OfficeId);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
