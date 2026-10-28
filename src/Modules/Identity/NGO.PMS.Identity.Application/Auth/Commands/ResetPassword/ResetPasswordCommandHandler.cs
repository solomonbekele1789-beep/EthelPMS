using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Events;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand>
{
    private readonly IIdentityDbContext _db;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordCommandHandler(IIdentityDbContext db, IPasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = Convert.ToBase64String(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(request.Token)));

        var resetToken = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken)
            ?? throw new BusinessRuleException("Invalid or expired password reset token.");

        if (!resetToken.IsValid)
            throw new BusinessRuleException("This password reset link has expired or already been used.");

        resetToken.UsedAt = DateTimeOffset.UtcNow;
        resetToken.User.SetPassword(_passwordHasher.Hash(request.NewPassword));
        resetToken.User.AddDomainEvent(new PasswordChangedEvent(resetToken.User.Id));

        await _db.SaveChangesAsync(cancellationToken);
    }
}
