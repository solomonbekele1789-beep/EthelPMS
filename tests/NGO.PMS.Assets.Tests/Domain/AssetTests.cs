using FluentAssertions;
using NGO.PMS.Assets.Domain.Entities;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Domain.Events;

namespace NGO.PMS.Assets.Tests.Domain;

public class AssetTests
{
    private readonly Guid _categoryId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    private Asset CreateDefaultAsset(
        decimal purchaseCost = 1200m,
        decimal residualValue = 200m,
        decimal usefulLifeYears = 5m,
        DepreciationMethod method = DepreciationMethod.StraightLine)
    {
        return Asset.Create(
            "ETHEL-A-000001",
            "Laptop",
            _categoryId,
            "Office A",
            DateTime.UtcNow,
            purchaseCost,
            method,
            usefulLifeYears,
            residualValue,
            _orgId);
    }

    [Fact]
    public void Create_ValidInput_SetsPropertiesAndRaisesEvent()
    {
        var purchaseDate = DateTime.UtcNow;

        var asset = Asset.Create(
            "ETHEL-A-000001",
            "Laptop",
            _categoryId,
            "Office A",
            purchaseDate,
            1200m,
            DepreciationMethod.StraightLine,
            5m,
            200m,
            _orgId);

        asset.AssetCode.Should().Be("ETHEL-A-000001");
        asset.Name.Should().Be("Laptop");
        asset.AssetCategoryId.Should().Be(_categoryId);
        asset.Location.Should().Be("Office A");
        asset.PurchaseDate.Should().Be(purchaseDate);
        asset.PurchaseCost.Should().Be(1200m);
        asset.CurrentBookValue.Should().Be(1200m);
        asset.DepreciationMethod.Should().Be(DepreciationMethod.StraightLine);
        asset.UsefulLifeYears.Should().Be(5m);
        asset.ResidualValue.Should().Be(200m);
        asset.Status.Should().Be(AssetStatus.Active);
        asset.Condition.Should().Be(AssetCondition.New);
        asset.OrganizationId.Should().Be(_orgId);
        asset.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<AssetRegisteredEvent>();
    }

    [Fact]
    public void CalculateDepreciation_StraightLine_ComputesCorrectly()
    {
        var purchaseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var asset = Asset.Create(
            "ETHEL-A-000002",
            "Laptop",
            _categoryId,
            "Office A",
            purchaseDate,
            1200m,
            DepreciationMethod.StraightLine,
            5m,
            200m,
            _orgId);

        // 2 years later
        var asOfDate = purchaseDate.AddYears(2);
        asset.CalculateDepreciation(asOfDate);

        // AnnualDepreciation = (1200 - 200) / 5 = 200
        asset.AnnualDepreciation.Should().Be(200m);
        // AccumulatedDepreciation ~ 200 * 2 = 400 (approximately, due to 365.25-day year calc)
        asset.AccumulatedDepreciation.Should().BeApproximately(400m, 2m);
        // CurrentBookValue ~ 1200 - 400 = 800
        asset.CurrentBookValue.Should().BeApproximately(800m, 2m);
    }

    [Fact]
    public void CalculateDepreciation_ReducingBalance_ComputesCorrectly()
    {
        var purchaseDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var asset = Asset.Create(
            "ETHEL-A-000003",
            "Vehicle",
            _categoryId,
            "Garage",
            purchaseDate,
            1200m,
            DepreciationMethod.ReducingBalance,
            5m,
            200m,
            _orgId);

        var asOfDate = purchaseDate.AddYears(2);
        asset.CalculateDepreciation(asOfDate);

        // Reducing balance produces a book value less than original but above residual
        asset.CurrentBookValue.Should().BeLessThan(1200m);
        asset.CurrentBookValue.Should().BeGreaterThan(200m);
        asset.AccumulatedDepreciation.Should().BeGreaterThan(0m);
    }

    [Fact]
    public void MarkInMaintenance_ActiveAsset_SetsStatus()
    {
        var asset = CreateDefaultAsset();

        asset.MarkInMaintenance();

        asset.Status.Should().Be(AssetStatus.InMaintenance);
    }

    [Fact]
    public void MarkInMaintenance_DisposedAsset_ThrowsInvalidOperationException()
    {
        var asset = CreateDefaultAsset();

        // Use reflection to set Status to Disposed (private setter)
        var statusProperty = typeof(Asset).GetProperty(nameof(Asset.Status));
        statusProperty!.SetValue(asset, AssetStatus.Disposed);

        var act = () => asset.MarkInMaintenance();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*disposed*");
    }

    [Fact]
    public void AssignTo_ValidUser_SetsAssignment()
    {
        var asset = CreateDefaultAsset();
        var userId = Guid.NewGuid();

        asset.AssignTo(userId, "John Doe");

        asset.AssignedToUserId.Should().Be(userId);
        asset.AssignedToName.Should().Be("John Doe");
        asset.AssignmentDate.Should().NotBeNull();
        asset.AssignmentDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }
}
