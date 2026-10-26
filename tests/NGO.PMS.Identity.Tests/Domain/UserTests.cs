using FluentAssertions;
using NGO.PMS.Identity.Domain.Entities;
using NGO.PMS.Identity.Domain.Events;

namespace NGO.PMS.Identity.Tests.Domain;

public class UserTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void User_Create_ShouldSetEmailLowercase()
    {
        // Arrange & Act
        var user = User.Create("John.Doe@Example.COM", "John", "Doe", _orgId);

        // Assert
        user.Email.Should().Be("john.doe@example.com");
        user.FirstName.Should().Be("John");
        user.LastName.Should().Be("Doe");
        user.OrganizationId.Should().Be(_orgId);
        user.IsActive.Should().BeTrue();
        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserCreatedEvent>();
    }

    [Fact]
    public void User_RecordFailedLogin_ShouldLockAfter5()
    {
        // Arrange
        var user = User.Create("test@example.com", "Test", "User", _orgId);
        user.SetPassword("hashed");

        // Act — 5 consecutive failures
        for (int i = 0; i < 5; i++)
            user.RecordFailedLogin();

        // Assert
        user.IsLockedOut.Should().BeTrue();
    }

    [Fact]
    public void User_IsLockedOut_ShouldReturnTrue_WhenLocked()
    {
        // Arrange
        var user = User.Create("test@example.com", "Test", "User", _orgId);

        // Lock the user via failed logins
        for (int i = 0; i < 5; i++)
            user.RecordFailedLogin();

        // Act & Assert
        user.IsLockedOut.Should().BeTrue();

        // After successful login, lockout should clear
        user.RecordSuccessfulLogin();
        user.IsLockedOut.Should().BeFalse();
    }
}
