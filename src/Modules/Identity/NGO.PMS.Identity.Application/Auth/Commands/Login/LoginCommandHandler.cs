using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IIdentityDbContext _db;
    private readonly IJwtTokenService _jwtService;
    private readonly IPasswordHasher _passwordHasher;

    public LoginCommandHandler(IIdentityDbContext db, IJwtTokenService jwtService, IPasswordHasher passwordHasher)
    {
        _db = db;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role).ThenInclude(r => r.RolePermissions).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim(), cancellationToken)
            ?? throw new BusinessRuleException("Invalid email or password.");

        if (!user.IsActive)
            throw new BusinessRuleException("Account is deactivated. Contact your administrator.");

        if (user.IsLockedOut)
            throw new BusinessRuleException("Account is temporarily locked. Try again later.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            user.RecordFailedLogin();
            await _db.SaveChangesAsync(cancellationToken);
            throw new BusinessRuleException("Invalid email or password.");
        }

        user.RecordSuccessfulLogin();

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
        var refreshToken = _jwtService.GenerateRefreshToken();
        var expiresAt = DateTimeOffset.UtcNow.AddDays(7);

        await _jwtService.StoreRefreshTokenAsync(user.Id, refreshToken, request.DeviceInfo ?? "unknown", expiresAt, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        var profile = new LoginUserProfile(
            user.Id, user.Email, user.FirstName, user.LastName,
            user.OrganizationId, org?.Name ?? string.Empty,
            user.OfficeId, office?.Name,
            roles, permissions);

        return new LoginResponse(accessToken, refreshToken, profile);
    }
}
