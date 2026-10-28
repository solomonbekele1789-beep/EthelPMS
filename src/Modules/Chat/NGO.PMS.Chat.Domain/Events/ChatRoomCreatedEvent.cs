using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Events;

public sealed record ChatRoomCreatedEvent(Guid ChatRoomId, ChatRoomType RoomType) : IDomainEvent;
