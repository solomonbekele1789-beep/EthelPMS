using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Participants.Application.Participants.Commands.RegisterParticipant;
using NGO.PMS.Participants.Domain.Enums;
using NGO.PMS.Participants.Tests.Helpers;

namespace NGO.PMS.Participants.Tests.Application;

public class RegisterParticipantTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = ParticipantsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ParticipantsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new RegisterParticipantCommandHandler(db, currentUser);
        var command = new RegisterParticipantCommand(
            FirstName: "Abebe",
            LastName: "Bekele",
            Gender: Gender.Male,
            MiddleName: null,
            DateOfBirth: null,
            IdNumber: null,
            Phone: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Participants.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.FirstName.Should().Be("Abebe");
        saved.LastName.Should().Be("Bekele");
        saved.Status.Should().Be(ParticipantStatus.Active);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyFirstName_HasError()
    {
        var validator = new RegisterParticipantCommandValidator();
        var command = new RegisterParticipantCommand(
            "", "Bekele", Gender.Male, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.FirstName);
    }

    [Fact]
    public void Validate_EmptyLastName_HasError()
    {
        var validator = new RegisterParticipantCommandValidator();
        var command = new RegisterParticipantCommand(
            "Abebe", "", Gender.Male, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.LastName);
    }

    [Fact]
    public void Validate_ValidCommand_NoErrors()
    {
        var validator = new RegisterParticipantCommandValidator();
        var command = new RegisterParticipantCommand(
            "Abebe", "Bekele", Gender.Male, null, null, null, null);

        var result = validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
