using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Commands.RemoveParticipant;

public sealed class RemoveParticipantCommandHandler : IRequestHandler<RemoveParticipantCommand, Guid>
{
    private readonly IChatDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public RemoveParticipantCommandHandler(IChatDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(RemoveParticipantCommand request, CancellationToken cancellationToken)
    {
        var room = await _db.ChatRooms
            .Include(r => r.Participants)
            .FirstOrDefaultAsync(r => r.Id == request.ChatRoomId, cancellationToken)
            ?? throw new InvalidOperationException($"Chat room {request.ChatRoomId} not found.");

        room.RemoveParticipant(request.UserId);
        await _db.SaveChangesAsync(cancellationToken);

        return room.Id;
    }
}
