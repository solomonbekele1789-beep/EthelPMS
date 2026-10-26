using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Notifications.Application.Abstractions;
using NGO.PMS.Notifications.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Application.Queries.GetNotificationPreferences;

public sealed class GetNotificationPreferencesQueryHandler
    : IRequestHandler<GetNotificationPreferencesQuery, List<UserNotificationPreferenceDto>>
{
    private readonly INotificationsDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationPreferencesQueryHandler(
        INotificationsDbContext db,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<List<UserNotificationPreferenceDto>> Handle(
        GetNotificationPreferencesQuery request,
        CancellationToken cancellationToken)
    {
        var userId = request.UserId ?? _currentUser.UserId;

        return await _db.UserNotificationPreferences
            .Where(p => p.UserId == userId)
            .OrderBy(p => p.EventType)
            .ProjectTo<UserNotificationPreferenceDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
