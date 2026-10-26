using MediatR;
using NGO.PMS.Notifications.Application.DTOs;

namespace NGO.PMS.Notifications.Application.Queries.GetUnreadCount;

public sealed record GetUnreadCountQuery : IRequest<UnreadCountDto>;
