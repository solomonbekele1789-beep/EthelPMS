using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Dashboards.Application.Commands.CreateDashboard;
using NGO.PMS.Dashboards.Domain.Enums;
using NGO.PMS.Dashboards.Tests.Helpers;

namespace NGO.PMS.Dashboards.Tests.Application;

public class CreateDashboardTests
{
    [Fact]
    public async Task Should_Create_Valid_Dashboard()
    {
        var userId = Guid.NewGuid();
        var orgId = Guid.NewGuid();
        using var db = DashboardsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = DashboardsTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId, fullName: "Test Admin");

        var handler = new CreateDashboardCommandHandler(db, currentUser);
        var command = new CreateDashboardCommand(
            Name: "Executive Dashboard",
            DashboardType: DashboardType.Executive,
            Description: "Main executive overview",
            IsShared: true,
            LayoutJson: "{\"cols\":12}");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.DashboardConfigs.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Executive Dashboard");
        saved.DashboardType.Should().Be(DashboardType.Executive);
        saved.IsShared.Should().BeTrue();
        saved.Description.Should().Be("Main executive overview");
    }

    [Fact]
    public void Should_Fail_Without_Name()
    {
        var validator = new CreateDashboardCommandValidator();
        var command = new CreateDashboardCommand(
            Name: "",
            DashboardType: DashboardType.Finance,
            Description: "No name dashboard",
            IsShared: false,
            LayoutJson: null);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_With_Name_Exceeding_MaxLength()
    {
        var validator = new CreateDashboardCommandValidator();
        var command = new CreateDashboardCommand(
            Name: new string('A', 201),
            DashboardType: DashboardType.Custom,
            Description: null,
            IsShared: false,
            LayoutJson: null);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }
}
