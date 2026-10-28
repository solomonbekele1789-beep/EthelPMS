using MediatR;

namespace NGO.PMS.Notifications.Application.Commands.NotificationPreferences.UpdateNotificationPreference;

public sealed record UpdateNotificationPreferenceCommand(
    string EventType,
    bool InAppEnabled,
    bool EmailEnabled,
    bool PushEnabled,
    bool SmsEnabled) : IRequest<Guid>;
