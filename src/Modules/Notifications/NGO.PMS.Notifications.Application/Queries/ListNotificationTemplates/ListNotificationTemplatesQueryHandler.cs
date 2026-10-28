using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Queries.ListNotificationTemplates;

public sealed class ListNotificationTemplatesQueryHandler
    : IRequestHandler<ListNotificationTemplatesQuery, PagedResult<NotificationTemplateDto>>
{
    private readonly INotificationsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListNotificationTemplatesQueryHandler(
        INotificationsDbContext db,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<NotificationTemplateDto>> Handle(
        ListNotificationTemplatesQuery request,
        CancellationToken cancellationToken)
    {
        var query = _db.NotificationTemplates.AsQueryable();

        if (request.IsActive.HasValue)
            query = query.Where(t => t.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(t => t.EventType)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<NotificationTemplateDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<NotificationTemplateDto>(items, totalCount, request.Page, request.PageSize);
    }
}
