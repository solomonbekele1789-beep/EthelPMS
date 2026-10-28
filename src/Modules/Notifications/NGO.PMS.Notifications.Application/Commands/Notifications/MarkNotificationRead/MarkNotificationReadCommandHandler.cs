using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.MarkNotificationRead;

public sealed class MarkNotificationReadCommandHandler
    : IRequestHandler<MarkNotificationReadCommand, Guid>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationReadCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(
                n => n.Id == request.NotificationId && n.RecipientUserId == _currentUser.UserId,
                cancellationToken)
            ?? throw new InvalidOperationException($"Notification {request.NotificationId} not found.");

        notification.MarkRead();
        await _db.SaveChangesAsync(cancellationToken);

        return notification.Id;
    }
}
