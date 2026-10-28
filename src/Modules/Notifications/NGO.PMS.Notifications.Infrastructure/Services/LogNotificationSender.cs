using Microsoft.Extensions.Logging;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Domain.Entities;

namespace NGO.PMS.Notifications.Infrastructure.Services;

/// <summary>
/// Logs notifications for development. In production, replace with
/// SignalR hub, Firebase Cloud Messaging, or email sender.
/// </summary>
public sealed class LogNotificationSender(ILogger<LogNotificationSender> logger) : INotificationSender
{
    public Task SendAsync(Notification notification, CancellationToken ct = default)
    {
        logger.LogInformation(
            "Notification [{Channel}] to user {UserId}: {Title}",
            notification.Channel,
            notification.RecipientUserId,
            notification.Title);
        return Task.CompletedTask;
    }
}
