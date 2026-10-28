using Microsoft.EntityFrameworkCore;
using NSubstitute;
using NGO.PMS.Assets.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Assets.Tests.Helpers;

public static class AssetsTestFixture
{
    public static AssetsDbContext CreateInMemoryDbContext(Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<AssetsDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var currentUser = CreateMockCurrentUser(orgId: organizationId);
        return new AssetsDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null, Guid? orgId = null, string? email = null)
    {
        var mock = Substitute.For<ICurrentUserService>();
        mock.UserId.Returns(userId ?? Guid.NewGuid());
        mock.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        mock.Email.Returns(email ?? "test@example.com");
        mock.FullName.Returns("Test User");
        mock.IsAuthenticated.Returns(true);
        mock.Permissions.Returns(new List<string>());
        mock.Roles.Returns(new List<string>());
        return mock;
    }
}
