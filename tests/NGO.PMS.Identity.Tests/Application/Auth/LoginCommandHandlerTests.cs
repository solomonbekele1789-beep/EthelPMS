using FluentAssertions;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Application.Auth.Commands.Login;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Tests.Helpers;
using NGO.PMS.SharedKernel.Exceptions;
using NSubstitute;

namespace NGO.PMS.Identity.Tests.Application.Auth;

public class LoginCommandHandlerTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    private (LoginCommandHandler handler, IPasswordHasher hasher, IJwtTokenService jwt) CreateHandler()
    {
        var db = IdentityTestFixture.CreateInMemoryDbContext(_orgId);
        var hasher = Substitute.For<IPasswordHasher>();
        var jwt = Substitute.For<IJwtTokenService>();

        // Seed a valid user with role and permission
        var user = User.Create("test@example.com", "Test", "User", _orgId);
        user.SetPassword("hashed_password");
        db.Users.Add(user);

        var permission = new Permission
        {
            Code = "identity.users.read",
            DisplayName = "Read Users",
            Module = "identity",
            Resource = "users",
            Action = "read"
        };
        db.Permissions.Add(permission);

        var role = Role.Create("Admin", "Administrator", _orgId);
        db.Roles.Add(role);

        var rolePermission = new RolePermission { RoleId = role.Id, PermissionId = permission.Id };
        db.RolePermissions.Add(rolePermission);

        var userRole = new UserRole { UserId = user.Id, RoleId = role.Id };
        db.UserRoles.Add(userRole);

        db.SaveChanges();

        var handler = new LoginCommandHandler(db, jwt, hasher);
        return (handler, hasher, jwt);
    }

    [Fact]
    public async Task LoginCommandHandler_ShouldReturnTokens_WhenValid()
    {
        // Arrange
        var (handler, hasher, jwt) = CreateHandler();
        hasher.Verify("password123", "hashed_password").Returns(true);
        jwt.GenerateAccessToken(Arg.Any<User>(), Arg.Any<IReadOnlyList<string>>(), Arg.Any<IReadOnlyList<string>>())
            .Returns("access_token_123");
        jwt.GenerateRefreshToken().Returns("refresh_token_123");

        var command = new LoginCommand("test@example.com", "password123", "web");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.AccessToken.Should().Be("access_token_123");
        result.RefreshToken.Should().Be("refresh_token_123");
        result.User.Should().NotBeNull();
        await jwt.Received(1).StoreRefreshTokenAsync(
            Arg.Any<Guid>(), "refresh_token_123", "web",
            Arg.Any<DateTimeOffset>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task LoginCommandHandler_ShouldFail_WhenLockedOut()
    {
        // Arrange — create handler with a locked-out user
        var db = IdentityTestFixture.CreateInMemoryDbContext(_orgId);
        var hasher = Substitute.For<IPasswordHasher>();
        var jwt = Substitute.For<IJwtTokenService>();

        var user = User.Create("locked@example.com", "Locked", "User", _orgId);
        user.SetPassword("hashed");
        // Lock the user
        for (int i = 0; i < 5; i++) user.RecordFailedLogin();
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var handler = new LoginCommandHandler(db, jwt, hasher);
        var command = new LoginCommand("locked@example.com", "anypassword", null);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<AccountLockedException>()
            .WithMessage("*locked*");
    }

    [Fact]
    public async Task LoginCommandHandler_ShouldFail_WhenWrongPassword()
    {
        // Arrange
        var (handler, hasher, _) = CreateHandler();
        hasher.Verify("wrongpassword", "hashed_password").Returns(false);

        var command = new LoginCommand("test@example.com", "wrongpassword", null);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid email or password*");
    }
}
