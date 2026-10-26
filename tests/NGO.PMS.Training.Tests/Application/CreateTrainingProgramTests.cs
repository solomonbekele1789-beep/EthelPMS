using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Training.Application.Commands.CreateTrainingProgram;
using NGO.PMS.Training.Domain.Enums;
using NGO.PMS.Training.Tests.Helpers;

namespace NGO.PMS.Training.Tests.Application;

public class CreateTrainingProgramTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesProgram()
    {
        using var db = TrainingTestFixture.CreateInMemoryDbContext();
        var currentUser = TrainingTestFixture.CreateMockCurrentUser();

        var handler = new CreateTrainingProgramCommandHandler(db, currentUser);
        var command = new CreateTrainingProgramCommand(
            Title: "Agricultural Training",
            Category: TrainingCategory.Agriculture,
            ProjectId: Guid.NewGuid(),
            TotalSessions: 8,
            Description: "Farm techniques training");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.TrainingPrograms.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Agricultural Training");
        saved.Category.Should().Be(TrainingCategory.Agriculture);
        saved.TotalSessions.Should().Be(8);
        saved.Description.Should().Be("Farm techniques training");
        saved.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Handle_EmptyTitle_ThrowsValidationException()
    {
        var validator = new CreateTrainingProgramCommandValidator();
        var command = new CreateTrainingProgramCommand(
            Title: "",
            Category: TrainingCategory.Technical,
            ProjectId: Guid.NewGuid(),
            TotalSessions: 5,
            Description: null);

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public async Task Handle_SavesChanges_ReturnsGuid()
    {
        using var db = TrainingTestFixture.CreateInMemoryDbContext();
        var currentUser = TrainingTestFixture.CreateMockCurrentUser();

        var handler = new CreateTrainingProgramCommandHandler(db, currentUser);
        var command = new CreateTrainingProgramCommand(
            Title: "Life Skills Program",
            Category: TrainingCategory.LifeSkills,
            ProjectId: Guid.NewGuid(),
            TotalSessions: 12,
            Description: null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        id.Should().NotBe(Guid.Empty);
        db.TrainingPrograms.Should().ContainSingle(p => p.Id == id);
    }
}
