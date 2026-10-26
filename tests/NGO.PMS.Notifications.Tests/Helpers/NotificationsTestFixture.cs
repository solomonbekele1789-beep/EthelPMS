using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Notifications.Tests.Helpers;

public static class NotificationsTestFixture
{
    public static NotificationsDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<NotificationsDbContext>()
            .UseInMemoryDatabase(databaseName: $"NotificationsTest_{Guid.NewGuid()}")
            .Options;

        return new NotificationsDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null,
        Guid? orgId = null,
        string fullName = "Test User")
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("notify@test.com");
        currentUser.FullName.Returns(fullName);
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
