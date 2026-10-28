using MediatR;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.MarkAllNotificationsRead;

public sealed record MarkAllNotificationsReadCommand : IRequest<int>;
