using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.SharedKernel.Outbox;

namespace NGO.PMS.Notifications.Application.Abstractions;

public interface INotificationsDbContext
{
    DbSet<NotificationTemplate> NotificationTemplates { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<UserNotificationPreference> UserNotificationPreferences { get; }
    DbSet<OutboxMessage> OutboxMessages { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
