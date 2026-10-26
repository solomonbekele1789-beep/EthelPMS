using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Commands.SendMessage;

public sealed class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Guid>
{
    private readonly IChatDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SendMessageCommandHandler(IChatDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var roomExists = await _db.ChatRooms
            .AnyAsync(r => r.Id == request.ChatRoomId, cancellationToken);

        if (!roomExists)
            throw new InvalidOperationException($"Chat room {request.ChatRoomId} not found.");

        var message = ChatMessage.Create(
            request.ChatRoomId,
            _currentUser.UserId,
            _currentUser.FullName,
            request.Content,
            request.ParentMessageId,
            request.AttachmentUrl,
            request.AttachmentName);

        _db.ChatMessages.Add(message);
        await _db.SaveChangesAsync(cancellationToken);

        return message.Id;
    }
}
