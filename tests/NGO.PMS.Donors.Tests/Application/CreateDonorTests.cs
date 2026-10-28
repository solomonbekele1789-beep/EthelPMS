using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Donors.Application.Commands.CreateDonor;
using NGO.PMS.Donors.Tests.Helpers;

namespace NGO.PMS.Donors.Tests.Application;

public class CreateDonorTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesDonor()
    {
        using var db = DonorsTestFixture.CreateInMemoryDbContext();
        var currentUser = DonorsTestFixture.CreateMockCurrentUser();

        var handler = new CreateDonorCommandHandler(db, currentUser);
        var command = new CreateDonorCommand(
            Name: "World Bank",
            Acronym: "WB",
            Country: "United States",
            Website: "https://www.worldbank.org",
            Email: "info@worldbank.org",
            Phone: "+1-202-473-1000",
            Address: "1818 H Street NW, Washington, DC",
            Notes: "Multilateral development bank");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Donors.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("World Bank");
        saved.Acronym.Should().Be("WB");
        saved.Country.Should().Be("United States");
        saved.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Handle_EmptyName_ThrowsValidationException()
    {
        var validator = new CreateDonorCommandValidator();
        var command = new CreateDonorCommand(
            Name: "",
            Acronym: null,
            Country: null,
            Website: null,
            Email: null,
            Phone: null,
            Address: null,
            Notes: null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public async Task Handle_ReturnsNewDonorId()
    {
        using var db = DonorsTestFixture.CreateInMemoryDbContext();
        var currentUser = DonorsTestFixture.CreateMockCurrentUser();

        var handler = new CreateDonorCommandHandler(db, currentUser);
        var command = new CreateDonorCommand(
            Name: "SIDA",
            Acronym: "SIDA",
            Country: "Sweden",
            Website: null,
            Email: null,
            Phone: null,
            Address: null,
            Notes: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        db.Donors.Should().ContainSingle(d => d.Id == id);
    }
}
