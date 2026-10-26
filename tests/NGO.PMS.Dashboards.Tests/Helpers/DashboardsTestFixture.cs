using Microsoft.EntityFrameworkCore;
using NGO.PMS.Dashboards.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Dashboards.Tests.Helpers;

public static class DashboardsTestFixture
{
    public static DashboardsDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<DashboardsDbContext>()
            .UseInMemoryDatabase(databaseName: $"DashboardsTest_{Guid.NewGuid()}")
            .Options;

        return new DashboardsDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null,
        Guid? orgId = null,
        string fullName = "Test User")
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("dashboards@test.com");
        currentUser.FullName.Returns(fullName);
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
