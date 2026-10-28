using MediatR;
using NGO.PMS.Chat.Domain.Enums;

namespace NGO.PMS.Chat.Application.Commands.CreateChatRoom;

public sealed record CreateChatRoomCommand(
    ChatRoomType Type,
    string? Name = null,
    string? Description = null,
    string? AvatarUrl = null,
    List<Guid>? ParticipantUserIds = null) : IRequest<Guid>;
