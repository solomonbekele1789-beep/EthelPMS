using FluentAssertions;
using NGO.PMS.Dashboards.Domain.Entities;

namespace NGO.PMS.Dashboards.Tests.Domain;

public class SavedFilterTests
{
    private readonly Guid _orgId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void Should_Create_SavedFilter_With_Valid_Data()
    {
        var filter = SavedFilter.Create(
            _orgId, _userId, "Active Projects", "Projects",
            "{\"status\":\"active\"}", isDefault: false);

        filter.Should().NotBeNull();
        filter.Id.Should().NotBeEmpty();
        filter.OrganizationId.Should().Be(_orgId);
        filter.UserId.Should().Be(_userId);
        filter.Name.Should().Be("Active Projects");
        filter.Module.Should().Be("Projects");
        filter.FilterJson.Should().Be("{\"status\":\"active\"}");
        filter.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Should_Set_Default_Filter()
    {
        var defaultFilter = SavedFilter.Create(
            _orgId, _userId, "Default View", "Finance",
            "{\"year\":2026}", isDefault: true);

        defaultFilter.IsDefault.Should().BeTrue();

        var nonDefault = SavedFilter.Create(
            _orgId, _userId, "Custom View", "Finance",
            "{\"year\":2025}", isDefault: false);

        nonDefault.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Should_Track_Module()
    {
        var projectsFilter = SavedFilter.Create(
            _orgId, _userId, "Project Filter", "Projects", null, false);

        var financeFilter = SavedFilter.Create(
            _orgId, _userId, "Finance Filter", "Finance", null, false);

        var mealFilter = SavedFilter.Create(
            _orgId, _userId, "MEAL Filter", "MEAL", null, false);

        projectsFilter.Module.Should().Be("Projects");
        financeFilter.Module.Should().Be("Finance");
        mealFilter.Module.Should().Be("MEAL");
    }
}
