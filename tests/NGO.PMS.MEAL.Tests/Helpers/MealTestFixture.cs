using Microsoft.EntityFrameworkCore;
using NSubstitute;
using NGO.PMS.MEAL.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.MEAL.Tests.Helpers;

public static class MealTestFixture
{
    public static MealDbContext CreateInMemoryDbContext(Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<MealDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var currentUser = CreateMockCurrentUser(orgId: organizationId);
        return new MealDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null, Guid? orgId = null, string? email = null)
    {
        var mock = Substitute.For<ICurrentUserService>();
        mock.UserId.Returns(userId ?? Guid.NewGuid());
        mock.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        mock.Email.Returns(email ?? "test@example.com");
        return mock;
    }
}
