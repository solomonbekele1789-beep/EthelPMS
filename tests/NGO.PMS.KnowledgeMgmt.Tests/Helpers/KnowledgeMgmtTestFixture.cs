using Microsoft.EntityFrameworkCore;
using NGO.PMS.KnowledgeMgmt.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.KnowledgeMgmt.Tests.Helpers;

public static class KnowledgeMgmtTestFixture
{
    public static KnowledgeMgmtDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<KnowledgeMgmtDbContext>()
            .UseInMemoryDatabase(databaseName: $"KnowledgeMgmtTest_{Guid.NewGuid()}")
            .Options;

        return new KnowledgeMgmtDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null,
        Guid? orgId = null,
        string fullName = "Test User")
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("kb@test.com");
        currentUser.FullName.Returns(fullName);
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
