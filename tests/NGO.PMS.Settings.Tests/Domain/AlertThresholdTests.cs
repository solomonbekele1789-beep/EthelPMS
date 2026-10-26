using FluentAssertions;
using NGO.PMS.Settings.Domain.Entities;
using NGO.PMS.Settings.Domain.Enums;

namespace NGO.PMS.Settings.Tests.Domain;

public class AlertThresholdTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    private AlertThreshold CreateThreshold(
        string module = "Finance",
        string metricName = "BudgetUtilization",
        decimal thresholdValue = 90m,
        ComparisonOperator @operator = ComparisonOperator.GreaterThan,
        AlertSeverity severity = AlertSeverity.Warning,
        bool isActive = true)
        => AlertThreshold.Create(_orgId, module, metricName, thresholdValue, @operator, severity, isActive);

    [Fact]
    public void Should_Create_AlertThreshold()
    {
        var threshold = AlertThreshold.Create(
            _orgId, "Finance", "BudgetUtilization", 90m,
            ComparisonOperator.GreaterThanOrEqual, AlertSeverity.Warning, true);

        threshold.Should().NotBeNull();
        threshold.Id.Should().NotBeEmpty();
        threshold.OrganizationId.Should().Be(_orgId);
        threshold.Module.Should().Be("Finance");
        threshold.MetricName.Should().Be("BudgetUtilization");
        threshold.ThresholdValue.Should().Be(90m);
        threshold.Operator.Should().Be(ComparisonOperator.GreaterThanOrEqual);
        threshold.AlertSeverity.Should().Be(AlertSeverity.Warning);
        threshold.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Should_Track_Operator_And_Severity()
    {
        var criticalThreshold = AlertThreshold.Create(
            _orgId, "Projects", "OverdueTaskCount", 10m,
            ComparisonOperator.GreaterThan, AlertSeverity.Critical, true);

        var infoThreshold = AlertThreshold.Create(
            _orgId, "MEAL", "DataCollectionRate", 50m,
            ComparisonOperator.LessThan, AlertSeverity.Info, true);

        criticalThreshold.Operator.Should().Be(ComparisonOperator.GreaterThan);
        criticalThreshold.AlertSeverity.Should().Be(AlertSeverity.Critical);

        infoThreshold.Operator.Should().Be(ComparisonOperator.LessThan);
        infoThreshold.AlertSeverity.Should().Be(AlertSeverity.Info);
    }

    [Fact]
    public void Should_Activate_And_Deactivate()
    {
        var threshold = CreateThreshold(isActive: true);
        threshold.IsActive.Should().BeTrue();

        threshold.Update(threshold.ThresholdValue, threshold.Operator, threshold.AlertSeverity, isActive: false);
        threshold.IsActive.Should().BeFalse();

        threshold.Update(threshold.ThresholdValue, threshold.Operator, threshold.AlertSeverity, isActive: true);
        threshold.IsActive.Should().BeTrue();
    }
}
