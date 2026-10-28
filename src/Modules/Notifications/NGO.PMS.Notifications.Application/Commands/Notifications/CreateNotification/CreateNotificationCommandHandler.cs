using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.CreateNotification;

public sealed class CreateNotificationCommandHandler
    : IRequestHandler<CreateNotificationCommand, Guid>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateNotificationCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        // Look up user preference to determine channel
        var preference = await _db.UserNotificationPreferences
            .FirstOrDefaultAsync(
                p => p.UserId == request.RecipientUserId && p.EventType == request.EventType,
                cancellationToken);

        // Determine channel: use preference if available, otherwise look up template default
        var channel = NotificationChannel.InApp;

        if (preference is not null)
        {
            if (preference.PushEnabled)
                channel = NotificationChannel.Push;
            else if (preference.EmailEnabled)
                channel = NotificationChannel.Email;
            else if (preference.SmsEnabled)
                channel = NotificationChannel.Sms;
            else
                channel = NotificationChannel.InApp;
        }
        else
        {
            var template = await _db.NotificationTemplates
                .FirstOrDefaultAsync(
                    t => t.EventType == request.EventType && t.IsActive,
                    cancellationToken);

            if (template is not null)
                channel = template.DefaultChannel;
        }

        var notification = Notification.Create(
            request.RecipientUserId,
            request.EventType,
            request.Title,
            request.Body,
            channel,
            request.Priority,
            request.ActionUrl,
            request.EntityId,
            request.EntityType);

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(cancellationToken);

        return notification.Id;
    }
}
