using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Application.DTOs;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Queries.GetChatRoom;

public sealed class GetChatRoomQueryHandler : IRequestHandler<GetChatRoomQuery, ChatRoomDto>
{
    private readonly IChatDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public GetChatRoomQueryHandler(IChatDbContext db, IMapper mapper, ICurrentUserService currentUser)
    {
        _db = db;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    public async Task<ChatRoomDto> Handle(GetChatRoomQuery request, CancellationToken cancellationToken)
    {
        var room = await _db.ChatRooms
            .Include(r => r.Participants)
            .Include(r => r.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
            .FirstOrDefaultAsync(r => r.Id == request.ChatRoomId, cancellationToken)
            ?? throw new InvalidOperationException($"Chat room {request.ChatRoomId} not found.");

        return _mapper.Map<ChatRoomDto>(room);
    }
}
