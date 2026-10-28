using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Entities;

public class ChatParticipant : AuditableEntity, IMultiTenant
{
    public Guid ChatRoomId { get; private set; }
    public Guid UserId { get; private set; }
    public string DisplayName { get; private set; } = string.Empty;
    public bool IsAdmin { get; private set; }
    public DateTime? LastReadAt { get; private set; }
    public bool IsMuted { get; private set; }
    public PresenceStatus Presence { get; private set; }
    public Guid TenantId { get; set; }

    private ChatParticipant() { }

    public static ChatParticipant Create(Guid chatRoomId, Guid userId, string displayName, bool isAdmin = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);

        return new ChatParticipant
        {
            ChatRoomId = chatRoomId,
            UserId = userId,
            DisplayName = displayName,
            IsAdmin = isAdmin,
            IsMuted = false,
            Presence = PresenceStatus.Offline
        };
    }

    public void UpdatePresence(PresenceStatus presence)
    {
        Presence = presence;
    }

    public void MarkRead(DateTime readAt)
    {
        LastReadAt = readAt;
    }

    public void Mute()
    {
        IsMuted = true;
    }

    public void Unmute()
    {
        IsMuted = false;
    }
}
