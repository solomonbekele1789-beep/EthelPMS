using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;
using NSubstitute;

namespace NGO.PMS.Chat.Tests.Helpers;

public static class ChatTestFixture
{
    public static ChatDbContext CreateInMemoryDbContext(Guid? organizationId = null)
    {
        var orgId = organizationId ?? Guid.NewGuid();
        var currentUser = CreateMockCurrentUser(orgId: orgId);

        var options = new DbContextOptionsBuilder<ChatDbContext>()
            .UseInMemoryDatabase(databaseName: $"ChatTest_{Guid.NewGuid()}")
            .Options;

        return new ChatDbContext(options, currentUser);
    }

    public static ICurrentUserService CreateMockCurrentUser(
        Guid? userId = null,
        Guid? orgId = null,
        string fullName = "Test User")
    {
        var currentUser = Substitute.For<ICurrentUserService>();
        currentUser.UserId.Returns(userId ?? Guid.NewGuid());
        currentUser.OrganizationId.Returns(orgId ?? Guid.NewGuid());
        currentUser.Email.Returns("chat@test.com");
        currentUser.FullName.Returns(fullName);
        currentUser.IsAuthenticated.Returns(true);
        return currentUser;
    }
}
