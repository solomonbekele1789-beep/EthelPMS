using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Identity.Application;
using NGO.PMS.Identity.Application.Users.Commands.CreateUser;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Tests.Helpers;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Identity.Tests.Application.Users;

public class CreateUserTests
{
    [Fact]
    public async Task CreateUserCommandHandler_ShouldCreateAndSendEmail()
    {
        // Arrange
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var currentUser = IdentityTestFixture.CreateMockCurrentUser(userId, orgId);
        var db = IdentityTestFixture.CreateInMemoryDbContext(orgId);
        var emailService = Substitute.For<IEmailService>();

        // Seed a role
        var role = Role.Create("TestRole", "Test", orgId);
        db.Roles.Add(role);
        await db.SaveChangesAsync();

        var handler = new CreateUserCommandHandler(db, currentUser, emailService);
        var command = new CreateUserCommand(
            "new.user@example.com", "New", "User", null, null, [role.Id]);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        var createdUser = await db.Users.FindAsync(result);
        createdUser.Should().NotBeNull();
        createdUser!.Email.Should().Be("new.user@example.com");
        await emailService.Received(1).SendPasswordSetupEmailAsync(
            "new.user@example.com", "New", Arg.Any<string>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public void CreateUserCommandValidator_ShouldFail_WhenEmailEmpty()
    {
        // Arrange
        var validator = new CreateUserCommandValidator();
        var command = new CreateUserCommand("", "John", "Doe", null, null, [Guid.NewGuid()]);

        // Act
        var result = validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }
}
