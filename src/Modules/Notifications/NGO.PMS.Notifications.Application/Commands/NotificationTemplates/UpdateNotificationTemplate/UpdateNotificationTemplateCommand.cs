using MediatR;
using NGO.PMS.Notifications.Domain.Enums;

namespace NGO.PMS.Notifications.Application.Commands.NotificationTemplates.UpdateNotificationTemplate;

public sealed record UpdateNotificationTemplateCommand(
    Guid Id,
    string TitleTemplateEn,
    string BodyTemplateEn,
    NotificationChannel DefaultChannel,
    string? TitleTemplateAm = null,
    string? BodyTemplateAm = null) : IRequest<Guid>;
