using MediatR;

namespace NGO.PMS.Chat.Application.Commands.RemoveParticipant;

public sealed record RemoveParticipantCommand(Guid ChatRoomId, Guid UserId) : IRequest<Guid>;
