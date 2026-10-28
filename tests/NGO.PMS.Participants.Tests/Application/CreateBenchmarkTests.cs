using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Participants.Application.Graduation.Commands.CreateBenchmark;
using NGO.PMS.Participants.Tests.Helpers;

namespace NGO.PMS.Participants.Tests.Application;

public class CreateBenchmarkTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesBenchmarkAndReturnsId()
    {
        var orgId = Guid.NewGuid();
        using var db = ParticipantsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ParticipantsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateBenchmarkCommandHandler(db, currentUser);
        var command = new CreateBenchmarkCommand(
            Name: "Income Benchmark",
            Domain: "Economic Strengthening",
            RequiredForGraduation: true,
            ProjectId: null,
            Description: "Measures household income level");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.GraduationBenchmarks.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Name.Should().Be("Income Benchmark");
        saved.Domain.Should().Be("Economic Strengthening");
        saved.RequiredForGraduation.Should().BeTrue();
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Validate_EmptyName_HasError()
    {
        var validator = new CreateBenchmarkCommandValidator();
        var command = new CreateBenchmarkCommand(
            "", "Economic Strengthening", false, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_EmptyDomain_HasError()
    {
        var validator = new CreateBenchmarkCommandValidator();
        var command = new CreateBenchmarkCommand(
            "Income Benchmark", "", false, null, null);

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Domain);
    }
}
