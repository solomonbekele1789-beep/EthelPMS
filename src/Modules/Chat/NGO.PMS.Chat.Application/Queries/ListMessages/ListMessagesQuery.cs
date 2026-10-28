using MediatR;
using NGO.PMS.Chat.Application.DTOs;

namespace NGO.PMS.Chat.Application.Queries.ListMessages;

public sealed record ListMessagesQuery(
    Guid ChatRoomId,
    int Page = 1,
    int PageSize = 50) : IRequest<PagedResult<ChatMessageDto>>;
