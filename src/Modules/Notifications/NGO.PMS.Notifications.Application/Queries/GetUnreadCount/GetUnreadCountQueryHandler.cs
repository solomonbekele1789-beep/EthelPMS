using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Queries.GetUnreadCount;

public sealed class GetUnreadCountQueryHandler
    : IRequestHandler<GetUnreadCountQuery, UnreadCountDto>
{
    private readonly INotificationsDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetUnreadCountQueryHandler(
        INotificationsDbContext db,
        ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<UnreadCountDto> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        var count = await _db.Notifications
            .CountAsync(
                n => n.RecipientUserId == _currentUser.UserId
                    && n.Status != NotificationStatus.Read
                    && n.Status != NotificationStatus.Archived,
                cancellationToken);

        return new UnreadCountDto { Count = count };
    }
}
