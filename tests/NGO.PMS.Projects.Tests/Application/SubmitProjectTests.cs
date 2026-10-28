using FluentAssertions;
using NGO.PMS.Projects.Application.Projects.Commands.SubmitProject;
using NGO.PMS.Projects.Domain.Entities;
using NGO.PMS.Projects.Domain.Enums;
using NGO.PMS.Projects.Tests.Helpers;

namespace NGO.PMS.Projects.Tests.Application;

public class SubmitProjectTests
{
    [Fact]
    public async Task Handler_ShouldSubmitDraftProject()
    {
        var orgId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(userId, orgId);

        var project = Project.Create("PRJ-SUB", "Submit Test",
            DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(1),
            100_000m, Guid.NewGuid(), orgId);
        db.Projects.Add(project);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new SubmitProjectCommandHandler(db, currentUser);
        await handler.Handle(new SubmitProjectCommand(project.Id), CancellationToken.None);

        var saved = await db.Projects.FindAsync(project.Id);
        saved!.Status.Should().Be(ProjectStatus.Submitted);
        saved.SubmittedBy.Should().Be(userId);
    }

    [Fact]
    public async Task Handler_ShouldThrow_WhenProjectNotFound()
    {
        var orgId = Guid.NewGuid();
        using var db = ProjectsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = ProjectsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new SubmitProjectCommandHandler(db, currentUser);
        var act = () => handler.Handle(new SubmitProjectCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<Exception>().WithMessage("*not found*");
    }
}
