using Microsoft.EntityFrameworkCore;
using NGO.PMS.Settings.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Settings.Tests.Helpers;

public static class SettingsTestFixture
{
    public static SettingsDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<SettingsDbContext>()
            .UseInMemoryDatabase(databaseName: $"SettingsTest_{Guid.NewGuid()}")
            .Options;

        return new SettingsDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null,
        Guid? orgId = null,
        string fullName = "Test User")
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("settings@test.com");
        currentUser.FullName.Returns(fullName);
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
