using MediatR;
using NGO.PMS.Notifications.Domain.Enums;

namespace NGO.PMS.Notifications.Application.Commands.NotificationTemplates.CreateNotificationTemplate;

public sealed record CreateNotificationTemplateCommand(
    string EventType,
    string TitleTemplateEn,
    string BodyTemplateEn,
    NotificationChannel DefaultChannel,
    string? TitleTemplateAm = null,
    string? BodyTemplateAm = null) : IRequest<Guid>;
