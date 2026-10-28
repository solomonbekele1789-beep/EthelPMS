using Microsoft.EntityFrameworkCore;
using NGO.PMS.Planning.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Planning.Tests.Helpers;

public static class PlanningTestFixture
{
    public static PlanningDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<PlanningDbContext>()
            .UseInMemoryDatabase(databaseName: $"PlanningTest_{Guid.NewGuid()}")
            .Options;

        return new PlanningDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(Guid? userId = null, Guid? orgId = null)
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("planner@test.com");
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
