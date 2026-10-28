using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Commands.NotificationPreferences.UpdateNotificationPreference;

public sealed class UpdateNotificationPreferenceCommandHandler
    : IRequestHandler<UpdateNotificationPreferenceCommand, Guid>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UpdateNotificationPreferenceCommandHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(UpdateNotificationPreferenceCommand request, CancellationToken cancellationToken)
    {
        var preference = await _db.UserNotificationPreferences
            .FirstOrDefaultAsync(
                p => p.UserId == _currentUser.UserId && p.EventType == request.EventType,
                cancellationToken);

        if (preference is null)
        {
            preference = UserNotificationPreference.Create(
                _currentUser.UserId,
                request.EventType,
                request.InAppEnabled,
                request.EmailEnabled,
                request.PushEnabled,
                request.SmsEnabled);

            _db.UserNotificationPreferences.Add(preference);
        }
        else
        {
            preference.Update(
                request.InAppEnabled,
                request.EmailEnabled,
                request.PushEnabled,
                request.SmsEnabled);
        }

        await _db.SaveChangesAsync(cancellationToken);

        return preference.Id;
    }
}
