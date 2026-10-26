using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Queries.ListChatRooms;

public sealed class ListChatRoomsQueryHandler : IRequestHandler<ListChatRoomsQuery, PagedResult<ChatRoomDto>>
{
    private readonly IChatDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListChatRoomsQueryHandler(IChatDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ChatRoomDto>> Handle(ListChatRoomsQuery request, CancellationToken cancellationToken)
    {
        var query = _db.ChatRooms
            .Include(r => r.Participants)
            .Include(r => r.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
            .Where(r => r.Participants.Any(p => p.UserId == _currentUser.UserId))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
            query = query.Where(r => r.Name != null && r.Name.Contains(request.Search));

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ChatRoomDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return new PagedResult<ChatRoomDto>(items, totalCount, request.Page, request.PageSize);
    }
}
