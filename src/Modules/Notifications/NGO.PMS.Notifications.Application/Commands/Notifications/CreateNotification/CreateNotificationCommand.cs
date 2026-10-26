using MediatR;
using NGO.PMS.Notifications.Domain.Enums;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.CreateNotification;

public sealed record CreateNotificationCommand(
    Guid RecipientUserId,
    string EventType,
    string Title,
    string Body,
    NotificationPriority Priority = NotificationPriority.Normal,
    string? ActionUrl = null,
    string? EntityId = null,
    string? EntityType = null) : IRequest<Guid>;
