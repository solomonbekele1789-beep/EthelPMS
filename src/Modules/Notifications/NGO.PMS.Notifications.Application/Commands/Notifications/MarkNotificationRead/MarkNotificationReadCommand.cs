using MediatR;

namespace NGO.PMS.Notifications.Application.Commands.Notifications.MarkNotificationRead;

public sealed record MarkNotificationReadCommand(Guid NotificationId) : IRequest<Guid>;
