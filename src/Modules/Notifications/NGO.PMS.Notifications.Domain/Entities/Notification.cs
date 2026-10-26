using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.Notifications.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Domain.Entities;

public class Notification : AuditableEntity, IMultiTenant
{
    public Guid RecipientUserId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public NotificationPriority Priority { get; private set; }
    public NotificationStatus Status { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public string? ActionUrl { get; private set; }
    public string? EntityId { get; private set; }
    public string? EntityType { get; private set; }
    public DateTime? ReadAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public string? FailureReason { get; private set; }
    public Guid TenantId { get; set; }

    private Notification() { }

    public static Notification Create(
        Guid recipientUserId,
        string eventType,
        string title,
        string body,
        NotificationChannel channel,
        NotificationPriority priority = NotificationPriority.Normal,
        string? actionUrl = null,
        string? entityId = null,
        string? entityType = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(eventType);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(body);

        var notification = new Notification
        {
            RecipientUserId = recipientUserId,
            EventType = eventType,
            Title = title,
            Body = body,
            Channel = channel,
            Priority = priority,
            Status = NotificationStatus.Pending,
            ActionUrl = actionUrl,
            EntityId = entityId,
            EntityType = entityType
        };

        notification.AddDomainEvent(new NotificationCreatedEvent(
            notification.Id, recipientUserId, eventType));

        return notification;
    }

    public void MarkSent()
    {
        Status = NotificationStatus.Sent;
        SentAt = DateTime.UtcNow;
    }

    public void MarkRead()
    {
        Status = NotificationStatus.Read;
        ReadAt = DateTime.UtcNow;

        AddDomainEvent(new NotificationReadEvent(Id, RecipientUserId));
    }

    public void MarkFailed(string reason)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        Status = NotificationStatus.Failed;
        FailureReason = reason;
    }

    public void Archive()
    {
        Status = NotificationStatus.Archived;
    }
}
