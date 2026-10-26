using FluentAssertions;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Tests.Domain;

public class OutcomeTests
{
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldSetCodeAndDescription()
    {
        var outcome = Outcome.Create("OC-01", "Improved livelihoods", _projectId, _orgId);

        outcome.Code.Should().Be("OC-01");
        outcome.Description.Should().Be("Improved livelihoods");
        outcome.ProjectId.Should().Be(_projectId);
        outcome.OrganizationId.Should().Be(_orgId);
    }

    [Fact]
    public void Create_ShouldThrow_WhenCodeEmpty()
    {
        var act = () => Outcome.Create("", "Desc", _projectId, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*code*");
    }

    [Fact]
    public void Create_ShouldThrow_WhenDescriptionEmpty()
    {
        var act = () => Outcome.Create("OC-01", "", _projectId, _orgId);
        act.Should().Throw<ArgumentException>().WithMessage("*Description*");
    }

    [Fact]
    public void Update_ShouldModifyFields()
    {
        var outcome = Outcome.Create("OC-01", "Original", _projectId, _orgId);

        outcome.Update("Updated desc", 10.5m, 85.0m, "Stable political climate");

        outcome.Description.Should().Be("Updated desc");
        outcome.BaselineValue.Should().Be(10.5m);
        outcome.TargetValue.Should().Be(85.0m);
        outcome.Assumptions.Should().Be("Stable political climate");
    }
}
