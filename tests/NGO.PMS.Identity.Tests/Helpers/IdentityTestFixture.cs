using Microsoft.EntityFrameworkCore;
using NGO.PMS.Identity.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Identity.Tests.Helpers;

public static class IdentityTestFixture
{
    public static IdentityDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId);
        currentUser.Email.Returns("admin@test.com");
        currentUser.IsAuthenticated.Returns(true);

        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseInMemoryDatabase(databaseName: $"IdentityTest_{Guid.NewGuid()}")
            .Options;

        return new IdentityDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(Guid? userId = null, Guid? orgId = null)
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("admin@test.com");
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
