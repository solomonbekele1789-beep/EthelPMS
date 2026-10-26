using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Queries.ListNotifications;

public sealed class ListNotificationsQueryHandler
    : IRequestHandler<ListNotificationsQuery, PagedResult<NotificationDto>>
{
    private readonly INotificationsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListNotificationsQueryHandler(
        INotificationsDbContext db,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<NotificationDto>> Handle(
        ListNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.Notifications
            .Where(n => n.RecipientUserId == _currentUser.UserId);

        if (request.Status.HasValue)
            query = query.Where(n => n.Status == request.Status.Value);

        if (!string.IsNullOrWhiteSpace(request.EventType))
            query = query.Where(n => n.EventType == request.EventType);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<NotificationDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationDto>(items, totalCount, request.Page, request.PageSize);
    }
}
