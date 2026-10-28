using FluentAssertions;
using NGO.PMS.Tasks.Domain.Entities;
using NGO.PMS.Tasks.Domain.Enums;
using NGO.PMS.Tasks.Domain.Events;

namespace NGO.PMS.Tasks.Tests.Domain;

public class TaskItemTests
{
    private readonly Guid _taskListId = Guid.NewGuid();
    private readonly Guid _orgId = Guid.NewGuid();

    private TaskItem CreateDefaultTask()
        => TaskItem.Create(_taskListId, "Test Task", _orgId);

    [Fact]
    public void Create_ValidInput_ReturnsTaskAndRaisesEvent()
    {
        var projectId = Guid.NewGuid();

        var task = TaskItem.Create(
            _taskListId, "My Task", _orgId,
            projectId: projectId,
            description: "A description",
            priority: TaskPriority.High);

        task.Should().NotBeNull();
        task.Title.Should().Be("My Task");
        task.Description.Should().Be("A description");
        task.Priority.Should().Be(TaskPriority.High);
        task.Status.Should().Be(TaskItemStatus.ToDo);
        task.ProgressPercentage.Should().Be(0);
        task.TaskListId.Should().Be(_taskListId);
        task.OrganizationId.Should().Be(_orgId);
        task.ProjectId.Should().Be(projectId);
        task.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<TaskCreatedEvent>();
    }

    [Fact]
    public void UpdateDetails_ChangesProperties()
    {
        var task = CreateDefaultTask();
        var dueDate = DateTime.UtcNow.AddDays(14);

        task.UpdateDetails("Updated Title", "Updated Desc", TaskPriority.Critical, dueDate);

        task.Title.Should().Be("Updated Title");
        task.Description.Should().Be("Updated Desc");
        task.Priority.Should().Be(TaskPriority.Critical);
        task.DueDate.Should().Be(dueDate);
    }

    [Fact]
    public void UpdateProgress_ValidPercentage_Updates()
    {
        var task = CreateDefaultTask();

        task.UpdateProgress(50);

        task.ProgressPercentage.Should().Be(50);
    }

    [Fact]
    public void UpdateProgress_InvalidPercentage_ThrowsArgumentOutOfRange()
    {
        var task = CreateDefaultTask();

        var actOver = () => task.UpdateProgress(101);
        actOver.Should().Throw<ArgumentOutOfRangeException>();

        var actUnder = () => task.UpdateProgress(-1);
        actUnder.Should().Throw<ArgumentOutOfRangeException>();
    }

    [Fact]
    public void Complete_At100Percent_SetsStatusDoneAndRaisesEvent()
    {
        var task = CreateDefaultTask();
        task.UpdateProgress(100);

        task.Complete();

        task.Status.Should().Be(TaskItemStatus.Done);
        task.DomainEvents.Should().Contain(e => e is TaskCompletedEvent);
    }

    [Fact]
    public void Complete_NotAt100Percent_ThrowsInvalidOperationException()
    {
        var task = CreateDefaultTask();
        task.UpdateProgress(75);

        var act = () => task.Complete();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*100%*");
    }
}
