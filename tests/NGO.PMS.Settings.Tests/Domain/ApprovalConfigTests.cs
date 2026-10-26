using FluentAssertions;
using NGO.PMS.Settings.Domain.Entities;

namespace NGO.PMS.Settings.Tests.Domain;

public class ApprovalConfigTests
{
    private readonly Guid _orgId = Guid.NewGuid();

    [Fact]
    public void Should_Create_ApprovalConfig()
    {
        var config = ApprovalConfig.Create(
            _orgId, "Procurement", "PurchaseOrder", 3, 5000m, true);

        config.Should().NotBeNull();
        config.Id.Should().NotBeEmpty();
        config.OrganizationId.Should().Be(_orgId);
        config.Module.Should().Be("Procurement");
        config.EntityType.Should().Be("PurchaseOrder");
        config.RequiredApprovalLevels.Should().Be(3);
        config.AutoApproveBelow.Should().Be(5000m);
        config.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Should_Validate_ApprovalLevels_Range()
    {
        // Level 0 should fail (below minimum of 1)
        var actZero = () => ApprovalConfig.Create(
            _orgId, "Finance", "BudgetRequest", 0, null, true);
        actZero.Should().Throw<ArgumentOutOfRangeException>();

        // Level 6 should fail (above maximum of 5)
        var actSix = () => ApprovalConfig.Create(
            _orgId, "Finance", "BudgetRequest", 6, null, true);
        actSix.Should().Throw<ArgumentOutOfRangeException>();

        // Levels 1 through 5 should succeed
        var config1 = ApprovalConfig.Create(_orgId, "Finance", "Invoice", 1, null, true);
        config1.RequiredApprovalLevels.Should().Be(1);

        var config5 = ApprovalConfig.Create(_orgId, "Finance", "Payment", 5, null, true);
        config5.RequiredApprovalLevels.Should().Be(5);

        // Update should also validate range
        var actUpdateZero = () => config1.Update(0, null, true);
        actUpdateZero.Should().Throw<ArgumentOutOfRangeException>();

        var actUpdateSix = () => config1.Update(6, null, true);
        actUpdateSix.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Should_Track_Module_And_EntityType()
    {
        var procurementConfig = ApprovalConfig.Create(
            _orgId, "Procurement", "PurchaseOrder", 2, 1000m, true);

        var financeConfig = ApprovalConfig.Create(
            _orgId, "Finance", "BudgetRevision", 4, null, true);

        procurementConfig.Module.Should().Be("Procurement");
        procurementConfig.EntityType.Should().Be("PurchaseOrder");

        financeConfig.Module.Should().Be("Finance");
        financeConfig.EntityType.Should().Be("BudgetRevision");
    }
}
