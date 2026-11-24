using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application.Auth.Commands.Login;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, LoginResponse>
{
    private readonly IIdentityDbContext _db;
    private readonly IJwtTokenService _jwtService;

    public RefreshTokenCommandHandler(IIdentityDbContext db, IJwtTokenService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<LoginResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var existingToken = await _jwtService.ValidateRefreshTokenAsync(request.RefreshToken, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Id == existingToken.UserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Entities.User), existingToken.UserId);

        if (!user.IsActive)
            throw new ForbiddenException("Account is deactivated.");

        await _jwtService.RevokeRefreshTokenAsync(request.RefreshToken, cancellationToken);

        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();

        var org = await _db.Organizations.FirstOrDefaultAsync(o => o.Id == user.OrganizationId, cancellationToken);
        var office = user.OfficeId.HasValue
            ? await _db.Offices.FirstOrDefaultAsync(o => o.Id == user.OfficeId, cancellationToken)
            : null;

        var accessToken = _jwtService.GenerateAccessToken(user, permissions, roles);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTimeOffset.UtcNow.AddDays(7);

        await _jwtService.StoreRefreshTokenAsync(user.Id, newRefreshToken, existingToken.DeviceInfo ?? "refreshed", expiresAt, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        var profile = new LoginUserProfile(
            user.Id, user.Email, user.FirstName, user.LastName,
            user.OrganizationId, org?.Name ?? string.Empty,
            user.OfficeId, office?.Name,
            roles, permissions);

        return new LoginResponse(accessToken, newRefreshToken, profile, ExpiresIn: 21600);
    }
}
