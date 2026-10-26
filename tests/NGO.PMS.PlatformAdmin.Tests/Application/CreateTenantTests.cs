using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.CreateTenant;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.PlatformAdmin.Infrastructure.Persistence;
using NGO.PMS.SharedKernel.Exceptions;

namespace NGO.PMS.PlatformAdmin.Tests.Application;

public class CreateTenantTests
{
    private static PlatformDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase($"PlatformTest_{Guid.NewGuid()}")
            .Options;
        return new PlatformDbContext(options);
    }

    [Fact]
    public async Task CreateTenantCommandHandler_ShouldCreateAndEnqueueProvisioning()
    {
        // Arrange
        var db = CreateDb();

        // Seed a subscription package
        var package = SubscriptionPackage.Create("Free", 10, 5,
            ["identity", "projects", "reporting"], 0m);
        db.SubscriptionPackages.Add(package);
        await db.SaveChangesAsync();

        var handler = new CreateTenantCommandHandler(db);
        var command = new CreateTenantCommand("Test NGO", "test-ngo", "admin@ngo.org", package.Id);

        // Act
        var tenantId = await handler.Handle(command, CancellationToken.None);

        // Assert
        tenantId.Should().NotBeEmpty();
        var created = await db.Tenants.FindAsync(tenantId);
        created.Should().NotBeNull();
        created!.Status.Should().Be(TenantStatus.Pending);
        created.Slug.Should().Be("test-ngo");
    }

    [Fact]
    public async Task CreateTenantCommandHandler_ShouldFail_WhenSlugDuplicate()
    {
        // Arrange
        var db = CreateDb();
        var package = SubscriptionPackage.Create("Pro", 50, 25,
            ["identity", "projects"], 49m);
        db.SubscriptionPackages.Add(package);

        var existing = PlatformTenant.Create("Existing NGO", "dup-slug", "old@ngo.org", package.Id);
        db.Tenants.Add(existing);
        await db.SaveChangesAsync();

        var handler = new CreateTenantCommandHandler(db);
        var command = new CreateTenantCommand("New NGO", "dup-slug", "new@ngo.org", package.Id);

        // Act & Assert
        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*slug*");
    }
}
