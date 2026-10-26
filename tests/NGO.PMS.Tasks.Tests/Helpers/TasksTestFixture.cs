using Microsoft.EntityFrameworkCore;
using NGO.PMS.SharedKernel.Domain;
using NGO.PMS.Tasks.Infrastructure.Persistence;
using NSubstitute;

namespace NGO.PMS.Tasks.Tests.Helpers;

public static class TasksTestFixture
{
    public static TasksDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<TasksDbContext>()
            .UseInMemoryDatabase(databaseName: $"TasksTest_{Guid.NewGuid()}")
            .Options;

        return new TasksDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(Guid? userId = null, Guid? orgId = null)
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("taskuser@test.com");
        currentUser.FullName.Returns("Test User");
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
