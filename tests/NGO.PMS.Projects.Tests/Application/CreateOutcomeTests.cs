using FluentAssertions;
using NGO.PMS.Projects.Application.ResultsFramework.Commands.CreateOutcome;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.Projects.Tests.Helpers;

namespace NGO.PMS.Projects.Tests.Application;

public class CreateOutcomeTests
{
    [Fact]
    public async Task Handler_ShouldCreateOutcome_UnderProject()
    {
        var orgId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(orgId: orgId);

        // Seed a project first
        var project = Project.Create("PRJ-OC", "Outcome Test",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            100_000m, Guid.NewGuid(), orgId);
        db.Projects.Add(project);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new CreateOutcomeCommandHandler(db, currentUser);
        var command = new CreateOutcomeCommand(
            ProjectId: project.Id,
            Code: "OC-01",
            Description: "Improved food security",
            BaselineValue: 20m,
            TargetValue: 80m);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Outcomes.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Code.Should().Be("OC-01");
        saved.ProjectId.Should().Be(project.Id);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public async Task Handler_ShouldThrow_WhenProjectNotFound()
    {
        var orgId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateOutcomeCommandHandler(db, currentUser);
        var command = new CreateOutcomeCommand(
            ProjectId: Guid.NewGuid(),
            Code: "OC-01",
            Description: "Test",
            BaselineValue: null,
            TargetValue: null);

        var act = () => handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<Exception>().WithMessage("*not found*");
    }
}
