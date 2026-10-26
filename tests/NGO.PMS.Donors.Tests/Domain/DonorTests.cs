using FluentAssertions;
using NGO.PMS.Donors.Domain.Entities;

namespace NGO.PMS.Donors.Tests.Domain;

public class DonorTests
{
    [Fact]
    public void Create_ValidInput_ReturnsDonor()
    {
        var donor = Donor.Create(
            "USAID",
            "USAID",
            "United States",
            "https://www.usaid.gov",
            "contact@usaid.gov",
            "+1-202-712-0000",
            "1300 Pennsylvania Ave NW, Washington, DC",
            "Primary bilateral donor");

        donor.Should().NotBeNull();
        donor.Id.Should().NotBeEmpty();
        donor.Name.Should().Be("USAID");
        donor.Acronym.Should().Be("USAID");
        donor.Country.Should().Be("United States");
        donor.Website.Should().Be("https://www.usaid.gov");
        donor.Email.Should().Be("contact@usaid.gov");
        donor.Phone.Should().Be("+1-202-712-0000");
        donor.Address.Should().Be("1300 Pennsylvania Ave NW, Washington, DC");
        donor.Notes.Should().Be("Primary bilateral donor");
        donor.IsActive.Should().BeTrue();
        donor.DefaultProcurementThreshold.Should().BeNull();
    }

    [Fact]
    public void Create_EmptyName_ThrowsArgumentException()
    {
        var act = () => Donor.Create("", null, null, null, null, null, null, null);

        act.Should().Throw<ArgumentException>()
            .WithMessage("*name*");
    }

    [Fact]
    public void SetProcurementThreshold_UpdatesValue()
    {
        var donor = Donor.Create("EU", null, null, null, null, null, null, null);

        donor.SetProcurementThreshold(50_000m);

        donor.DefaultProcurementThreshold.Should().Be(50_000m);
    }

    [Fact]
    public void Deactivate_SetsInactive()
    {
        var donor = Donor.Create("DFID", null, "UK", null, null, null, null, null);
        donor.IsActive.Should().BeTrue();

        donor.Deactivate();

        donor.IsActive.Should().BeFalse();
    }
}
