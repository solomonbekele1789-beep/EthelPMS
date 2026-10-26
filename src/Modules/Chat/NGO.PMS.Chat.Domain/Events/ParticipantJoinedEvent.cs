using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Events;

public sealed record ParticipantJoinedEvent(Guid ChatRoomId, Guid UserId) : IDomainEvent;
