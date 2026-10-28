using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Tasks.Application.Commands.Tasks.CreateTask;
using NGO.PMS.Tasks.Domain.Enums;
using NGO.PMS.Tasks.Tests.Helpers;

namespace NGO.PMS.Tasks.Tests.Application;

public class CreateTaskTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesTask()
    {
        var orgId = Guid.NewGuid();
        using var db = TasksTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = TasksTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateTaskCommandHandler(db, currentUser);
        var command = new CreateTaskCommand(
            TaskListId: Guid.NewGuid(),
            Title: "Implement feature",
            Description: "Build the new feature",
            Priority: TaskPriority.High);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.TaskItems.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.Title.Should().Be("Implement feature");
        saved.Description.Should().Be("Build the new feature");
        saved.Priority.Should().Be(TaskPriority.High);
        saved.Status.Should().Be(TaskItemStatus.ToDo);
        saved.OrganizationId.Should().Be(orgId);
    }

    [Fact]
    public void Handle_EmptyTitle_ThrowsValidationException()
    {
        var validator = new CreateTaskCommandValidator();
        var command = new CreateTaskCommand(
            TaskListId: Guid.NewGuid(),
            Title: "");

        var result = validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public async Task Handle_ReturnsNewTaskId()
    {
        var orgId = Guid.NewGuid();
        using var db = TasksTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = TasksTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateTaskCommandHandler(db, currentUser);
        var command = new CreateTaskCommand(
            TaskListId: Guid.NewGuid(),
            Title: "Another task");

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        db.TaskItems.Should().ContainSingle(t => t.Id == id);
    }
}
