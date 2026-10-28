using FluentAssertions;
using FluentValidation.TestHelper;
using NGO.PMS.Notifications.Application.Commands.Notifications.CreateNotification;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.Notifications.Tests.Helpers;

namespace NGO.PMS.Notifications.Tests.Application;

public class CreateNotificationTests
{
    [Fact]
    public async Task Handle_ValidCommand_CreatesNotification()
    {
        var orgId = Guid.NewGuid();
        using var db = NotificationsTestFixture.CreateInMemoryDbContext(orgId);
        var currentUser = NotificationsTestFixture.CreateMockCurrentUser(orgId: orgId);

        var handler = new CreateNotificationCommandHandler(db, currentUser);
        var recipientId = Guid.NewGuid();
        var command = new CreateNotificationCommand(
            RecipientUserId: recipientId,
            EventType: "project.approved",
            Title: "Project Approved",
            Body: "Your project has been approved by the review board.",
            Priority: NotificationPriority.High);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var saved = await db.Notifications.FindAsync(id);
        saved.Should().NotBeNull();
        saved!.RecipientUserId.Should().Be(recipientId);
        saved.Title.Should().Be("Project Approved");
        saved.Status.Should().Be(NotificationStatus.Pending);
        saved.Priority.Should().Be(NotificationPriority.High);
        saved.Channel.Should().Be(NotificationChannel.InApp);
    }

    [Fact]
    public void Handle_EmptyTitle_ThrowsValidationException()
    {
        var validator = new CreateNotificationCommandValidator();
        var command = new CreateNotificationCommand(
            RecipientUserId: Guid.NewGuid(),
            EventType: "task.assigned",
            Title: "",
            Body: "You have a new task.");

        var result = validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public async Task Handle_ReturnsNotificationId()
    {
        using var db = NotificationsTestFixture.CreateInMemoryDbContext();
        var currentUser = NotificationsTestFixture.CreateMockCurrentUser();

        var handler = new CreateNotificationCommandHandler(db, currentUser);
        var command = new CreateNotificationCommand(
            RecipientUserId: Guid.NewGuid(),
            EventType: "report.generated",
            Title: "Report Generated",
            Body: "Your monthly report is ready.",
            Priority: NotificationPriority.Normal,
            ActionUrl: "/reports/123",
            EntityId: "123",
            EntityType: "Report");

        var notificationId = await handler.Handle(command, CancellationToken.None);

        notificationId.Should().NotBeEmpty();
        var notification = await db.Notifications.FindAsync(notificationId);
        notification.Should().NotBeNull();
        notification!.Id.Should().Be(notificationId);
        notification.ActionUrl.Should().Be("/reports/123");
        notification.EntityId.Should().Be("123");
        notification.EntityType.Should().Be("Report");
    }
}
