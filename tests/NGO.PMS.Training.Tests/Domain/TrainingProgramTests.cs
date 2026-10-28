using FluentAssertions;
using NGO.PMS.Training.Domain.Entities;
using NGO.PMS.Training.Domain.Enums;

namespace NGO.PMS.Training.Tests.Domain;

public class TrainingProgramTests
{
    private readonly Guid _projectId = Guid.NewGuid();

    private TrainingProgram CreateDefaultProgram()
    {
        return TrainingProgram.Create(
            "Community Health Training",
            TrainingCategory.Health,
            _projectId,
            totalSessions: 10,
            description: "Comprehensive health awareness program");
    }

    [Fact]
    public void Create_ValidInput_ReturnsProgram()
    {
        var program = TrainingProgram.Create(
            "Financial Literacy Workshop",
            TrainingCategory.Financial,
            _projectId,
            totalSessions: 5,
            description: "Basic financial management skills");

        program.Title.Should().Be("Financial Literacy Workshop");
        program.Category.Should().Be(TrainingCategory.Financial);
        program.ProjectId.Should().Be(_projectId);
        program.TotalSessions.Should().Be(5);
        program.Description.Should().Be("Basic financial management skills");
        program.IsActive.Should().BeTrue();
        program.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Update_ChangesProperties()
    {
        var program = CreateDefaultProgram();

        program.Update(
            "Advanced Health Training",
            TrainingCategory.Health,
            totalSessions: 15,
            description: "Advanced health module");

        program.Title.Should().Be("Advanced Health Training");
        program.TotalSessions.Should().Be(15);
        program.Description.Should().Be("Advanced health module");
        program.Category.Should().Be(TrainingCategory.Health);
    }

    [Fact]
    public void Deactivate_SetsInactive()
    {
        var program = CreateDefaultProgram();
        program.IsActive.Should().BeTrue();

        program.Deactivate();

        program.IsActive.Should().BeFalse();
    }
}
