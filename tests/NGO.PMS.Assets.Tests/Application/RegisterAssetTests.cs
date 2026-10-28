using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Assets.Application.Commands.Assets.RegisterAsset;
using NGO.PMS.Assets.Domain.Enums;
using NGO.PMS.Assets.Tests.Helpers;

namespace NGO.PMS.Assets.Tests.Application;

public class RegisterAssetTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = AssetsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = AssetsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new RegisterAssetCommandHandler(db, currentUser);
        var command = new RegisterAssetCommand(
            Name: "Laptop Dell XPS",
            AssetCategoryId: Guid.NewGuid(),
            Location: "Head Office",
            PurchaseDate: DateTime.UtcNow,
            PurchaseCost: 1500m,
            DepreciationMethod: DepreciationMethod.StraightLine,
            UsefulLifeYears: 5m,
            ResidualValue: 300m,
            SerialNumber: null,
            ModelNumber: null,
            DonorGrantId: null,
            ProjectId: null,
            PurchaseOrderId: null,
            Description: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Assets.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Laptop Dell XPS");
        saved.AssetCode.Should().MatchRegex(@"^ETHEL-A-\d{6}$");
        saved.PurchaseCost.Should().Be(1500m);
        saved.Status.Should().Be(AssetStatus.Active);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyName_HasError()
    {
        var validator = new RegisterAssetCommandValidator();
        var command = new RegisterAssetCommand(
            Name: "",
            AssetCategoryId: Guid.NewGuid(),
            Location: "Office",
            PurchaseDate: DateTime.UtcNow,
            PurchaseCost: 1000m,
            DepreciationMethod: DepreciationMethod.StraightLine,
            UsefulLifeYears: 5m,
            ResidualValue: 100m,
            SerialNumber: null,
            ModelNumber: null,
            DonorGrantId: null,
            ProjectId: null,
            PurchaseOrderId: null,
            Description: null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_ZeroPurchaseCost_HasError()
    {
        var validator = new RegisterAssetCommandValidator();
        var command = new RegisterAssetCommand(
            Name: "Laptop",
            AssetCategoryId: Guid.NewGuid(),
            Location: "Office",
            PurchaseDate: DateTime.UtcNow,
            PurchaseCost: 0m,
            DepreciationMethod: DepreciationMethod.StraightLine,
            UsefulLifeYears: 5m,
            ResidualValue: 100m,
            SerialNumber: null,
            ModelNumber: null,
            DonorGrantId: null,
            ProjectId: null,
            PurchaseOrderId: null,
            Description: null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.PurchaseCost);
    }
}
