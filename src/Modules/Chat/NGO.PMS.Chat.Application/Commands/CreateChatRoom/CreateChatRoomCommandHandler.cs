using MediatR;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.Chat.Domain.Entities;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Commands.CreateChatRoom;

public sealed class CreateChatRoomCommandHandler : IRequestHandler<CreateChatRoomCommand, Guid>
{
    private readonly IChatDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateChatRoomCommandHandler(IChatDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateChatRoomCommand request, CancellationToken cancellationToken)
    {
        var room = ChatRoom.Create(
            request.Type,
            _currentUser.UserId,
            request.Name,
            request.Description,
            request.AvatarUrl);

        // Add creator as admin participant
        room.AddParticipant(_currentUser.UserId, _currentUser.FullName, isAdmin: true);

        // Add additional participants
        if (request.ParticipantUserIds is not null)
        {
            foreach (var userId in request.ParticipantUserIds.Where(id => id != _currentUser.UserId))
            {
                room.AddParticipant(userId, string.Empty);
            }
        }

        _db.ChatRooms.Add(room);
        await _db.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}
