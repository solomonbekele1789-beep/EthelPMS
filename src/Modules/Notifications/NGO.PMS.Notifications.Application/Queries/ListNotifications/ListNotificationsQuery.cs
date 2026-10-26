using MediatR;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.Notifications.Domain.Enums;

namespace NGO.PMS.Notifications.Application.Queries.ListNotifications;

public sealed record ListNotificationsQuery(
    NotificationStatus? Status = null,
    string? EventType = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<NotificationDto>>;
