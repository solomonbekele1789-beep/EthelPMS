using MediatR;
using NGO.PMS.Notifications.Application.DTOs;

namespace NGO.PMS.Notifications.Application.Queries.ListNotificationTemplates;

public sealed record ListNotificationTemplatesQuery(
    bool? IsActive = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<NotificationTemplateDto>>;
