using Microsoft.EntityFrameworkCore;
using NSubstitute;
using NGO.PMS.Procurement.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Procurement.Tests.Helpers;

public static class ProcurementTestFixture
{
    public static ProcurementDbContext CreateInMemoryDbContext(Guid organizationId)
    {
        var options = new DbContextOptionsBuilder<ProcurementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var currentUser = CreateMockCurrentUser(orgId: organizationId);
        return new ProcurementDbContext(options, currentUser);
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
