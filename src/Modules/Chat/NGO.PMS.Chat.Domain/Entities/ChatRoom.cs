using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.Chat.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Entities;

public class ChatRoom : AuditableEntity, IMultiTenant
{
    public string? Name { get; private set; }
    public ChatRoomType Type { get; private set; }
    public string? Description { get; private set; }
    public string? AvatarUrl { get; private set; }
    public bool IsActive { get; private set; }
    public Guid? CreatedByUserId { get; private set; }
    public Guid TenantId { get; set; }

    public List<ChatParticipant> Participants { get; private set; } = [];
    public List<ChatMessage> Messages { get; private set; } = [];

    private ChatRoom() { }

    public static ChatRoom Create(
        ChatRoomType type,
        Guid createdByUserId,
        string? name = null,
        string? description = null,
        string? avatarUrl = null)
    {
        if (type != ChatRoomType.Direct)
            ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var room = new ChatRoom
        {
            Name = name,
            Type = type,
            Description = description,
            AvatarUrl = avatarUrl,
            IsActive = true,
            CreatedByUserId = createdByUserId
        };

        room.AddDomainEvent(new ChatRoomCreatedEvent(room.Id, type));
        return room;
    }

    public void Update(string? name, string? description, string? avatarUrl)
    {
        if (Type != ChatRoomType.Direct)
            ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name;
        Description = description;
        AvatarUrl = avatarUrl;
    }

    public void Archive()
    {
        IsActive = false;
    }

    public ChatParticipant AddParticipant(Guid userId, string displayName, bool isAdmin = false)
    {
        var participant = ChatParticipant.Create(Id, userId, displayName, isAdmin);
        Participants.Add(participant);
        AddDomainEvent(new ParticipantJoinedEvent(Id, userId));
        return participant;
    }

    public void RemoveParticipant(Guid userId)
    {
        var participant = Participants.FirstOrDefault(p => p.UserId == userId)
            ?? throw new InvalidOperationException($"User {userId} is not a participant of this chat room.");
        Participants.Remove(participant);
    }
}
