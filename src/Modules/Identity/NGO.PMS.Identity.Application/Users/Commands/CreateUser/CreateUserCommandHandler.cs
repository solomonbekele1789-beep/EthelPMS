using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Users.Commands.CreateUser;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IIdentityDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;

    public CreateUserCommandHandler(IIdentityDbContext db, ICurrentUserService currentUser, IEmailService emailService)
    {
        _db = db;
        _currentUser = currentUser;
        _emailService = emailService;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var emailExists = await _db.Users
            .AnyAsync(u => u.Email == request.Email.ToLowerInvariant().Trim()
                        && u.OrganizationId == _currentUser.OrganizationId, cancellationToken);

        if (emailExists)
            throw new BusinessRuleException($"A user with email '{request.Email}' already exists in this organization.");

        var user = User.Create(request.Email, request.FirstName, request.LastName, _currentUser.OrganizationId);
        if (request.Phone is not null) user.UpdateProfile(request.FirstName, request.LastName, request.Phone, request.OfficeId);

        // Assign roles
        foreach (var roleId in request.RoleIds)
        {
            var roleExists = await _db.Roles.AnyAsync(r => r.Id == roleId, cancellationToken);
            if (!roleExists) throw new NotFoundException("Role", roleId);

            _db.UserRoles.Add(new UserRole
            {
                UserId = user.Id,
                RoleId = roleId,
                AssignedBy = _currentUser.UserId
            });
        }

        // Generate setup password token
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var tokenHash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));

        var setupToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(48)
        };

        _db.Users.Add(user);
        await _db.PasswordResetTokens.AddAsync(setupToken, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        await _emailService.SendPasswordSetupEmailAsync(user.Email, user.FirstName, token, cancellationToken);

        return user.Id;
    }
}
