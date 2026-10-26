using MediatR;

namespace NGO.PMS.Chat.Application.Commands.AddParticipant;

public sealed record AddParticipantCommand(
    Guid ChatRoomId,
    Guid UserId,
    string DisplayName,
    bool IsAdmin = false) : IRequest<Guid>;
