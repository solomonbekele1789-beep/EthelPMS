using Microsoft.EntityFrameworkCore;
using Moq;
using NGO.PMS.Risk.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Risk.Tests.Helpers;

public static class RiskTestFixture
{
    public static RiskDbContext CreateInMemoryDbContext(Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<RiskDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var currentUser = CreateMockCurrentUser(orgId: organizationId);
        return new RiskDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null, Guid? orgId = null, string? email = null)
    {
        var mock = new Mock<ICurrentUserService>();
        mock.Setup(x => x.UserId).Returns(userId ?? Guid.NewGuid());
        mock.Setup(x => x.OrganizationId).Returns(orgId ?? Guid.NewGuid());
        mock.Setup(x => x.Email).Returns(email ?? "test@example.com");
        mock.Setup(x => x.FullName).Returns("Test User");
        mock.Setup(x => x.IsAuthenticated).Returns(true);
        mock.Setup(x => x.Permissions).Returns(new List<string>());
        mock.Setup(x => x.Roles).Returns(new List<string>());
        return mock.Object;
    }
}
