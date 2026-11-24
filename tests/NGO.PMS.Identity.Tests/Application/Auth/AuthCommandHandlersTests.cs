using System.Security.Cryptography;
using System.Text;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Application.Auth.Commands.ForgotPassword;
using NGO.PMS.Identity.Application.Auth.Commands.RefreshToken;
using NGO.PMS.Identity.Application.Auth.Commands.ResetPassword;
using NGO.PMS.Identity.Application.Auth.Commands.SetupPassword;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Tests.Helpers;
using NGO.PMS.SharedKernel.Exceptions;
using NSubstitute;

namespace NGO.PMS.Identity.Tests.Application.Auth;

public class AuthCommandHandlersTests
{
    [Fact]
    public async Task ForgotPassword_ShouldCreate1HourToken_AndSendEmail_ForActiveUser()
    {
        var orgId = Guid.NewGuid();
        using var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);
        var user = User.Create("alice@ngo.org", "Alice", "Bekele", orgId);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var emailService = Substitute.For<IEmailService>();
        var handler = new ForgotPasswordCommandHandler(db, emailService);

        await handler.Handle(new ForgotPasswordCommand("alice@ngo.org"), CancellationToken.None);

        var token = await db.PasswordResetTokens.SingleAsync();
        token.UserId.Should().Be(user.Id);
        token.Purpose.Should().Be("password_reset");
        token.ExpiresAt.Should().BeCloseTo(DateTimeOffset.UtcNow.AddHours(1), TimeSpan.FromMinutes(2));
        await emailService.Received(1).SendPasswordResetEmailAsync(
            "alice@ngo.org", "Alice", Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ResetPassword_ShouldUpdatePassword_AndRevokeAllRefreshTokens()
    {
        var orgId = Guid.NewGuid();
        using var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);
        var user = User.Create("bob@ngo.org", "Bob", "Tadesse", orgId);
        var rawToken = "valid-reset-token";
        var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        db.Users.Add(user);
        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            Purpose = "password_reset",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        });
        await db.SaveChangesAsync();

        var hasher = Substitute.For<IPasswordHasher>();
        hasher.Hash("NewP@ssword123").Returns("hashed-new-pw");
        var jwt = Substitute.For<IJwtTokenService>();

        var handler = new ResetPasswordCommandHandler(db, hasher, jwt);
        await handler.Handle(new ResetPasswordCommand(rawToken, "NewP@ssword123"), CancellationToken.None);

        var updated = await db.Users.FindAsync(user.Id);
        updated!.PasswordHash.Should().Be("hashed-new-pw");
        await jwt.Received(1).RevokeAllUserTokensAsync(user.Id, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task SetupPassword_ShouldReject_WhenPasswordAlreadySet()
    {
        var orgId = Guid.NewGuid();
        using var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);
        var user = User.Create("carol@ngo.org", "Carol", "Desta", orgId);
        user.SetPassword("existing-hash");
        var rawToken = "setup-token";
        var tokenHash = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));

        db.Users.Add(user);
        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            Purpose = "password_setup",
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(24)
        });
        await db.SaveChangesAsync();

        var hasher = Substitute.For<IPasswordHasher>();
        var handler = new SetupPasswordCommandHandler(db, hasher);

        var act = () => handler.Handle(new SetupPasswordCommand(rawToken, "NewP@ssword123"), CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>();
    }

    [Fact]
    public async Task RefreshToken_ShouldThrowUnauthorized_WhenTokenInvalid()
    {
        using var db = IdentityTestFixture.CreateInMemoryDbContext();
        var jwt = Substitute.For<IJwtTokenService>();
        jwt.ValidateRefreshTokenAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
            .Returns((RefreshToken?)null);

        var handler = new RefreshTokenCommandHandler(db, jwt);
        var act = () => handler.Handle(new RefreshTokenCommand("bad-token"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
