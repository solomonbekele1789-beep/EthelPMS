using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Commands.DeactivateUser;

public class DeactivateUserCommandHandler : IRequestHandler<DeactivateUserCommand>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IJwtTokenService _jwtService;

    public DeactivateUserCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser, IJwtTokenService jwtService)
    {
        _db = db;
        _currentUser = currentUser;
        _jwtService = jwtService;
    }

    public async Task Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        if (request.Id == _currentUser.UserId)
            throw new BusinessRuleException("You cannot deactivate your own account.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        user.Deactivate();
        await _jwtService.RevokeAllUserTokensAsync(user.Id, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
