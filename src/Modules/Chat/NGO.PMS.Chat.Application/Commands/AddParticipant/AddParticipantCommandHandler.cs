using MediatR;
using Microsoft.EntityFrameworkCore;
using NGO.PMS.Chat.Application.Abstractions;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Application.Commands.AddParticipant;

public sealed class AddParticipantCommandHandler : IRequestHandler<AddParticipantCommand, Guid>
{
    private readonly IChatDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AddParticipantCommandHandler(IChatDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddParticipantCommand request, CancellationToken cancellationToken)
    {
        var room = await _db.ChatRooms
            .Include(r => r.Participants)
            .FirstOrDefaultAsync(r => r.Id == request.ChatRoomId, cancellationToken)
            ?? throw new InvalidOperationException($"Chat room {request.ChatRoomId} not found.");

        var participant = room.AddParticipant(request.UserId, request.DisplayName, request.IsAdmin);
        await _db.SaveChangesAsync(cancellationToken);

        return participant.Id;
    }
}
