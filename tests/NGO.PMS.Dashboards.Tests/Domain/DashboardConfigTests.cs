using FluentAssertions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.Dashboards.Domain.Enums;
using NGO.PMS.Dashboards.Domain.Events;

namespace NGO.PMS.Dashboards.Tests.Domain;

public class DashboardConfigTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _ownerId = Guid.NewGuid();

    private DashboardConfig CreateDashboard(
        string name = "Test Dashboard",
        DashboardType type = DashboardType.Executive)
        => DashboardConfig.Create(_orgId, name, type, "Test description", _ownerId, true, null);

    [Fact]
    public void Should_Create_DashboardConfig_With_Valid_Data()
    {
        var dashboard = DashboardConfig.Create(
            _orgId, "Executive Overview", DashboardType.Executive,
            "Main dashboard", _ownerId, true, "{\"cols\":12}");

        dashboard.Should().NotBeNull();
        dashboard.Id.Should().NotBeEmpty();
        dashboard.OrganizationId.Should().Be(_orgId);
        dashboard.Name.Should().Be("Executive Overview");
        dashboard.DashboardType.Should().Be(DashboardType.Executive);
        dashboard.Description.Should().Be("Main dashboard");
        dashboard.OwnerId.Should().Be(_ownerId);
        dashboard.IsShared.Should().BeTrue();
        dashboard.IsDefault.Should().BeFalse();
        dashboard.LayoutJson.Should().Be("{\"cols\":12}");
        dashboard.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DashboardCreatedEvent>()
            .Which.DashboardType.Should().Be("Executive");
    }

    [Fact]
    public void Should_Update_DashboardConfig()
    {
        var dashboard = CreateDashboard();

        dashboard.Update("Updated Name", "Updated description", false, "{\"cols\":6}");

        dashboard.Name.Should().Be("Updated Name");
        dashboard.Description.Should().Be("Updated description");
        dashboard.IsShared.Should().BeFalse();
        dashboard.LayoutJson.Should().Be("{\"cols\":6}");
    }

    [Fact]
    public void Should_Soft_Delete_DashboardConfig()
    {
        var dashboard = CreateDashboard();

        dashboard.IsDeleted.Should().BeFalse();
        dashboard.DeletedAt.Should().BeNull();

        dashboard.IsDeleted = true;
        dashboard.DeletedAt = DateTimeOffset.UtcNow;
        dashboard.DeletedBy = "admin@test.com";

        dashboard.IsDeleted.Should().BeTrue();
        dashboard.DeletedAt.Should().NotBeNull();
        dashboard.DeletedBy.Should().Be("admin@test.com");
    }

    [Fact]
    public void Should_Set_Default_Dashboard()
    {
        var dashboard = CreateDashboard();
        dashboard.IsDefault.Should().BeFalse();

        dashboard.SetDefault(true);

        dashboard.IsDefault.Should().BeTrue();

        dashboard.SetDefault(false);

        dashboard.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Should_Create_With_DashboardType()
    {
        var financeDashboard = DashboardConfig.Create(
            _orgId, "Finance Dashboard", DashboardType.Finance,
            null, _ownerId, false, null);

        financeDashboard.DashboardType.Should().Be(DashboardType.Finance);
        financeDashboard.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DashboardCreatedEvent>()
            .Which.DashboardType.Should().Be("Finance");

        var mealDashboard = DashboardConfig.Create(
            _orgId, "MEAL Dashboard", DashboardType.MEAL,
            null, _ownerId, false, null);

        mealDashboard.DashboardType.Should().Be(DashboardType.MEAL);
        mealDashboard.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<DashboardCreatedEvent>()
            .Which.DashboardType.Should().Be("MEAL");
    }
}
