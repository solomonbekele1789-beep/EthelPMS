using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Events;

public sealed record MessageSentEvent(Guid MessageId, Guid ChatRoomId, Guid SenderUserId) : IDomainEvent;
