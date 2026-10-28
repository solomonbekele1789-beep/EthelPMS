using MediatR;
using NGO.PMS.Chat.Application.DTOs;

namespace NGO.PMS.Chat.Application.Queries.ListChatRooms;

public sealed record ListChatRoomsQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ChatRoomDto>>;
