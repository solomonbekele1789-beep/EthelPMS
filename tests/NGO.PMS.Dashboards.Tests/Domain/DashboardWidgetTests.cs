using FluentAssertions;
using NGO.PMS.Dashboards.Domain.Entities;
using NGO.PMS.Dashboards.Domain.Enums;

namespace NGO.PMS.Dashboards.Tests.Domain;

public class DashboardWidgetTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _dashboardConfigId = Guid.NewGuid();

    private DashboardWidget CreateWidget(
        WidgetType type = WidgetType.Chart,
        string title = "Test Widget",
        int position = 1)
        => DashboardWidget.Create(
            _orgId, _dashboardConfigId, type, title,
            "Projects", "{\"query\":\"select *\"}", "{\"color\":\"blue\"}",
            position, width: 4, height: 3, refreshIntervalMinutes: 15);

    [Fact]
    public void Should_Create_Widget_With_Valid_Data()
    {
        var widget = DashboardWidget.Create(
            _orgId, _dashboardConfigId, WidgetType.KPI, "Active Projects",
            "Projects", "{\"metric\":\"count\"}", "{\"icon\":\"chart\"}",
            position: 0, width: 3, height: 2, refreshIntervalMinutes: 30);

        widget.Should().NotBeNull();
        widget.Id.Should().NotBeEmpty();
        widget.OrganizationId.Should().Be(_orgId);
        widget.DashboardConfigId.Should().Be(_dashboardConfigId);
        widget.WidgetType.Should().Be(WidgetType.KPI);
        widget.Title.Should().Be("Active Projects");
        widget.DataSourceModule.Should().Be("Projects");
        widget.QueryDefinition.Should().Be("{\"metric\":\"count\"}");
        widget.DisplayConfig.Should().Be("{\"icon\":\"chart\"}");
        widget.Position.Should().Be(0);
        widget.Width.Should().Be(3);
        widget.Height.Should().Be(2);
        widget.RefreshIntervalMinutes.Should().Be(30);
    }

    [Fact]
    public void Should_Update_Widget_Properties()
    {
        var widget = CreateWidget();

        widget.Update("Updated Widget", "{\"query\":\"updated\"}", "{\"color\":\"red\"}", 2, 6, 4);

        widget.Title.Should().Be("Updated Widget");
        widget.QueryDefinition.Should().Be("{\"query\":\"updated\"}");
        widget.DisplayConfig.Should().Be("{\"color\":\"red\"}");
        widget.Position.Should().Be(2);
        widget.Width.Should().Be(6);
        widget.Height.Should().Be(4);
    }

    [Fact]
    public void Should_Set_Position_And_Dimensions()
    {
        var widget = CreateWidget(position: 0);

        widget.Position.Should().Be(0);
        widget.Width.Should().Be(4);
        widget.Height.Should().Be(3);

        widget.Update(widget.Title, widget.QueryDefinition, widget.DisplayConfig,
            position: 5, width: 12, height: 6);

        widget.Position.Should().Be(5);
        widget.Width.Should().Be(12);
        widget.Height.Should().Be(6);
    }

    [Fact]
    public void Should_Track_DashboardConfigId()
    {
        var dashboardId1 = Guid.NewGuid();
        var dashboardId2 = Guid.NewGuid();

        var widget1 = DashboardWidget.Create(
            _orgId, dashboardId1, WidgetType.Table, "Widget 1",
            "Finance", null, null, 0, 6, 4, null);

        var widget2 = DashboardWidget.Create(
            _orgId, dashboardId2, WidgetType.Map, "Widget 2",
            "Projects", null, null, 0, 6, 4, null);

        widget1.DashboardConfigId.Should().Be(dashboardId1);
        widget2.DashboardConfigId.Should().Be(dashboardId2);
        widget1.DashboardConfigId.Should().NotBe(widget2.DashboardConfigId);
    }
}
