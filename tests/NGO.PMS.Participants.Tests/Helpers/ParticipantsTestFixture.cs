using Microsoft.EntityFrameworkCore;
using NSubstitute;
using NGO.PMS.Participants.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Participants.Tests.Helpers;

public static class ParticipantsTestFixture
{
    public static ParticipantsDbContext CreateInMemoryDbContext(Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<ParticipantsDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var currentUser = CreateMockCurrentUser(orgId: organizationId);
        return new ParticipantsDbContext(options, currentUser);
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
