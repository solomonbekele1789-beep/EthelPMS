using MediatR;
using NGO.PMS.Chat.Application.DTOs;

namespace NGO.PMS.Chat.Application.Queries.GetChatRoom;

public sealed record GetChatRoomQuery(Guid ChatRoomId) : IRequest<ChatRoomDto>;
