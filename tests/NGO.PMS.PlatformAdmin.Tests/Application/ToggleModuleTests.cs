using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.PlatformAdmin.Application.Tenants.Commands.ToggleModule;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.PlatformAdmin.Infrastructure.Persistence;

namespace NGO.PMS.PlatformAdmin.Tests.Application;

public class ToggleModuleTests
{
    private static PlatformDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase($"PlatformTest_{Guid.NewGuid()}")
            .Options;
        return new PlatformDbContext(options);
    }

    [Fact]
    public async Task ToggleModuleCommandHandler_ShouldEnableModule()
    {
        // Arrange
        var db = CreateDb();
        var package = SubscriptionPackage.Create("Pro", 50, 25,
            ["identity", "projects", "reporting"], 49m);
        db.SubscriptionPackages.Add(package);

        var tenant = PlatformTenant.Create("Test NGO", "test-ngo", "admin@ngo.org", package.Id);
        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        // Clear domain events from Create
        tenant.ClearDomainEvents();

        var handler = new ToggleModuleCommandHandler(db);
        var command = new ToggleModuleCommand(tenant.Id, "projects", true);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        var module = await db.TenantModules
            .FirstOrDefaultAsync(m => m.TenantId == tenant.Id && m.ModuleName == "projects");
        module.Should().NotBeNull();
        module!.IsEnabled.Should().BeTrue();
        module.EnabledAt.Should().NotBeNull();
    }
}
