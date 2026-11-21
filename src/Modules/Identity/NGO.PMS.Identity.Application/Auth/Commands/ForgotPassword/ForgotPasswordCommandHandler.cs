using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Domain.Entities;

namespace NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand>
{
    private readonly IIdentityDbContext _db;
    private readonly IEmailService _emailService;

    public ForgotPasswordCommandHandler(IIdentityDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLowerInvariant().Trim(), cancellationToken);

        // Always succeed silently (do not reveal whether email exists or is active)
        if (user is null || !user.IsActive) return;

        // Invalidate any prior unused password reset tokens for this user
        var priorTokens = await _db.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.UsedAt == null && t.Purpose == "password_reset")
            .ToListAsync(cancellationToken);

        foreach (var prior in priorTokens)
            prior.UsedAt = DateTimeOffset.UtcNow;

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var tokenHash = Convert.ToBase64String(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));

        var resetToken = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            Purpose = "password_reset",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        };

        await _db.PasswordResetTokens.AddAsync(resetToken, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        await _emailService.SendPasswordResetEmailAsync(user.Email, user.FirstName, token, cancellationToken);
    }
}
