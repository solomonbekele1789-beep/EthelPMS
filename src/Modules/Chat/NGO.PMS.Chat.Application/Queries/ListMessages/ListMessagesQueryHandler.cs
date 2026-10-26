using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Queries.ListMessages;

public sealed class ListMessagesQueryHandler : IRequestHandler<ListMessagesQuery, PagedResult<ChatMessageDto>>
{
    private readonly IChatDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public ListMessagesQueryHandler(IChatDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<ChatMessageDto>> Handle(ListMessagesQuery request, CancellationToken cancellationToken)
    {
        var query = _db.ChatMessages
            .Where(m => m.ChatRoomId == request.ChatRoomId)
            .AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ProjectTo<ChatMessageDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        // Compute thread reply counts
        var messageIds = items.Where(m => m.ParentMessageId is null).Select(m => m.Id).ToList();
        if (messageIds.Count > 0)
        {
            var replyCounts = await _db.ChatMessages
                .Where(m => m.ParentMessageId != null && messageIds.Contains(m.ParentMessageId!.Value))
                .GroupBy(m => m.ParentMessageId)
                .Select(g => new { ParentId = g.Key, Count = g.Count() })
                .ToListAsync(cancellationToken);

            foreach (var rc in replyCounts)
            {
                var item = items.FirstOrDefault(i => i.Id == rc.ParentId);
                if (item is not null) item.ThreadReplyCount = rc.Count;
            }
        }

        return new PagedResult<ChatMessageDto>(items, totalCount, request.Page, request.PageSize);
    }
}
