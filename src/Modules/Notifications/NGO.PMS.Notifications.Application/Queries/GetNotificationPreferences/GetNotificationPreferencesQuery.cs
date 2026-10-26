using MediatR;
using NGO.PMS.Notifications.Application.DTOs;

namespace NGO.PMS.Notifications.Application.Queries.GetNotificationPreferences;

public sealed record GetNotificationPreferencesQuery(
    Guid? UserId = null) : IRequest<List<UserNotificationPreferenceDto>>;
