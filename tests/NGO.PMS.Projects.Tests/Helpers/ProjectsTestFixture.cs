using Microsoft.EntityFrameworkCore;
using NGO.PMS.Projects.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Projects.Tests.Helpers;

public static class ProjectsTestFixture
{
    public static ProjectsDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<ProjectsDbContext>()
            .UseInMemoryDatabase(databaseName: $"ProjectsTest_{Guid.NewGuid()}")
            .Options;

        return new ProjectsDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(Guid? userId = null, Guid? orgId = null)
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("pm@test.com");
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
