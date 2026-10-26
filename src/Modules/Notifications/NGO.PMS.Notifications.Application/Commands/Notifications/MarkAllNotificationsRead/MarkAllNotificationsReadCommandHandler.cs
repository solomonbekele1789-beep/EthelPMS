using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.MarkAllNotificationsRead;

public sealed class MarkAllNotificationsReadCommandHandler
    : IRequestHandler<MarkAllNotificationsReadCommand, int>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsReadCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        var unreadNotifications = await _db.Notifications
            .Where(n => n.RecipientUserId == _currentUser.UserId
                && n.Status != NotificationStatus.Read
                && n.Status != NotificationStatus.Archived)
            .ToListAsync(cancellationToken);

        foreach (var notification in unreadNotifications)
        {
            notification.MarkRead();
        }

        await _db.SaveChangesAsync(cancellationToken);

        return unreadNotifications.Count;
    }
}
