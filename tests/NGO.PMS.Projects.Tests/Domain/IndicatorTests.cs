using FluentAssertions;
using NGO.PMS.Projects.Domain.Entities;

namespace NGO.PMS.Projects.Tests.Domain;

public class IndicatorTests
{
    private readonly Guid _projectId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Create_ShouldSetCodeAndName()
    {
        var indicator = Indicator.Create("IND-01", "Number of beneficiaries", _projectId, _orgId);

        indicator.Code.Should().Be("IND-01");
        indicator.Name.Should().Be("Number of beneficiaries");
        indicator.OutcomeId.Should().BeNull();
        indicator.OutputId.Should().BeNull();
    }

    [Fact]
    public void LinkToOutcome_ShouldClearOutputId()
    {
        var indicator = Indicator.Create("IND-01", "Test", _projectId, _orgId);
        var outcomeId = Guid.NewGuid();
        var outputId = Guid.NewGuid();

        indicator.LinkToOutput(outputId);
        indicator.OutputId.Should().Be(outputId);

        indicator.LinkToOutcome(outcomeId);
        indicator.OutcomeId.Should().Be(outcomeId);
        indicator.OutputId.Should().BeNull("linking to outcome should clear output");
    }

    [Fact]
    public void LinkToOutput_ShouldClearOutcomeId()
    {
        var indicator = Indicator.Create("IND-01", "Test", _projectId, _orgId);
        var outcomeId = Guid.NewGuid();
        var outputId = Guid.NewGuid();

        indicator.LinkToOutcome(outcomeId);
        indicator.OutcomeId.Should().Be(outcomeId);

        indicator.LinkToOutput(outputId);
        indicator.OutputId.Should().Be(outputId);
        indicator.OutcomeId.Should().BeNull("linking to output should clear outcome");
    }
}
