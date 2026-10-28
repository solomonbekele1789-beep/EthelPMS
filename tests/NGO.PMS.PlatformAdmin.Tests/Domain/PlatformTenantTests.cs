using FluentAssertions;
using NGO.PMS.PlatformAdmin.Domain.Constants;
using NGO.PMS.PlatformAdmin.Domain.Entities;
using NGO.PMS.PlatformAdmin.Domain.Events;

namespace NGO.PMS.PlatformAdmin.Tests.Domain;

public class PlatformTenantTests
{
    private readonly Guid _packageId = Guid.NewGuid();

    [Fact]
    public void PlatformTenant_Create_ShouldSetPendingStatus()
    {
        // Act
        var tenant = PlatformTenant.Create("Test NGO", "test-ngo", "admin@test.org", _packageId);

        // Assert
        tenant.Status.Should().Be(TenantStatus.Pending);
        tenant.Name.Should().Be("Test NGO");
        tenant.Slug.Should().Be("test-ngo");
        tenant.AdminEmail.Should().Be("admin@test.org");
        tenant.SubscriptionPackageId.Should().Be(_packageId);
        tenant.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<TenantCreatedEvent>();
    }

    [Fact]
    public void PlatformTenant_Activate_ShouldSetTimestamp()
    {
        // Arrange
        var tenant = PlatformTenant.Create("Test NGO", "test-ngo", "admin@test.org", _packageId);
        var beforeActivation = DateTimeOffset.UtcNow;

        // Act
        tenant.Activate();

        // Assert
        tenant.Status.Should().Be(TenantStatus.Active);
        tenant.ActivatedAt.Should().NotBeNull();
        tenant.ActivatedAt.Should().BeOnOrAfter(beforeActivation);
        tenant.DomainEvents.Should().HaveCount(2); // TenantCreatedEvent + TenantActivatedEvent
    }

    [Fact]
    public void PlatformTenant_Suspend_ShouldRequireReason()
    {
        // Arrange
        var tenant = PlatformTenant.Create("Test NGO", "test-ngo", "admin@test.org", _packageId);
        tenant.Activate();

        // Act — suspend with reason should succeed
        tenant.Suspend("Non-payment of subscription fees");

        // Assert
        tenant.Status.Should().Be(TenantStatus.Suspended);
        tenant.SuspensionReason.Should().Be("Non-payment of subscription fees");
        tenant.SuspendedAt.Should().NotBeNull();

        // Act — suspend without reason should throw
        var tenant2 = PlatformTenant.Create("Another NGO", "another-ngo", "admin@other.org", _packageId);
        var act = () => tenant2.Suspend("");
        act.Should().Throw<ArgumentException>().WithMessage("*Reason*");
    }
}
