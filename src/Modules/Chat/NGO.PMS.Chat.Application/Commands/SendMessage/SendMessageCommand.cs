using MediatR;

namespace NGO.PMS.Chat.Application.Commands.SendMessage;

public sealed record SendMessageCommand(
    Guid ChatRoomId,
    string Content,
    Guid? ParentMessageId = null,
    string? AttachmentUrl = null,
    string? AttachmentName = null) : IRequest<Guid>;
