using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Partnerships.Application.Commands.RegisterSubGrantee;
using NGO.PMS.Partnerships.Domain.Enums;
using NGO.PMS.Partnerships.Tests.Helpers;

namespace NGO.PMS.Partnerships.Tests.Application;

public class RegisterSubGranteeTests
{
    [Fact]
    public async Task Should_Register_Valid_SubGrantee()
    {
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        using var db = PartnershipsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = PartnershipsTestFixture.CreateMockCurrentUser(userId: userId, orgId: orgId);

        var handler = new RegisterSubGranteeCommandHandler(db, currentUser);
        var command = new RegisterSubGranteeCommand(
            Name: "Community Health Initiative",
            ContactPerson: "Dr. Abebe Tadesse",
            ContactEmail: "abebe@chi-ethiopia.org",
            ContactPhone: "+251-911-987654",
            Country: "Ethiopia",
            PartnerType: PartnerType.CommunityOrg,
            RegistrationNumber: "CHI-2024-055",
            Address: "Hawassa, SNNPR, Ethiopia");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.SubGrantees.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Community Health Initiative");
        saved.ContactPerson.Should().Be("Dr. Abebe Tadesse");
        saved.ContactEmail.Should().Be("abebe@chi-ethiopia.org");
        saved.Country.Should().Be("Ethiopia");
        saved.PartnerType.Should().Be(PartnerType.CommunityOrg);
        saved.Status.Should().Be(PartnerStatus.Prospect);
    }

    [Fact]
    public void Should_Fail_Without_Name()
    {
        var validator = new RegisterSubGranteeCommandValidator();
        var command = new RegisterSubGranteeCommand(
            Name: "",
            ContactPerson: "Jane Doe",
            ContactEmail: "jane@test.org",
            ContactPhone: null,
            Country: "Kenya",
            PartnerType: PartnerType.LocalNGO,
            RegistrationNumber: null,
            Address: null);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Fail_Without_ContactEmail()
    {
        var validator = new RegisterSubGranteeCommandValidator();
        var command = new RegisterSubGranteeCommand(
            Name: "Valid Partner Name",
            ContactPerson: "Jane Doe",
            ContactEmail: "",
            ContactPhone: null,
            Country: "Kenya",
            PartnerType: PartnerType.LocalNGO,
            RegistrationNumber: null,
            Address: null);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.ContactEmail);
    }
}
