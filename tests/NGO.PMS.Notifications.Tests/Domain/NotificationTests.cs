using FluentAssertions;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.Notifications.Domain.Events;

namespace NGO.PMS.Notifications.Tests.Domain;

public class NotificationTests
{
    private readonly Guid _recipientId = Guid.NewGuid();

    private Notification CreateNotification()
        => Notification.Create(
            _recipientId,
            "project.approved",
            "Project Approved",
            "Your project has been approved.",
            NotificationChannel.InApp);

    [Fact]
    public void Create_RaisesNotificationCreatedEvent()
    {
        var notification = Notification.Create(
            _recipientId,
            "task.assigned",
            "Task Assigned",
            "You have been assigned a new task.",
            NotificationChannel.Email,
            NotificationPriority.High);

        notification.Should().NotBeNull();
        notification.Id.Should().NotBeEmpty();
        notification.RecipientUserId.Should().Be(_recipientId);
        notification.EventType.Should().Be("task.assigned");
        notification.Title.Should().Be("Task Assigned");
        notification.Body.Should().Be("You have been assigned a new task.");
        notification.Channel.Should().Be(NotificationChannel.Email);
        notification.Priority.Should().Be(NotificationPriority.High);
        notification.Status.Should().Be(NotificationStatus.Pending);
        notification.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<NotificationCreatedEvent>()
            .Which.RecipientUserId.Should().Be(_recipientId);
    }

    [Fact]
    public void MarkSent_UpdatesStatusAndSentAt()
    {
        var notification = CreateNotification();

        notification.MarkSent();

        notification.Status.Should().Be(NotificationStatus.Sent);
        notification.SentAt.Should().NotBeNull();
        notification.SentAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void MarkRead_RaisesNotificationReadEvent()
    {
        var notification = CreateNotification();
        notification.ClearDomainEvents();

        notification.MarkRead();

        notification.Status.Should().Be(NotificationStatus.Read);
        notification.ReadAt.Should().NotBeNull();
        notification.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<NotificationReadEvent>()
            .Which.UserId.Should().Be(_recipientId);
    }

    [Fact]
    public void MarkFailed_SetsFailureReason()
    {
        var notification = CreateNotification();

        notification.MarkFailed("SMTP server unreachable");

        notification.Status.Should().Be(NotificationStatus.Failed);
        notification.FailureReason.Should().Be("SMTP server unreachable");
    }
}
