namespace NGO.PMS.Chat.Application.DTOs;

public class ChatParticipantDto
{
    public Guid Id { get; set; }
    public Guid ChatRoomId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
    public DateTime? LastReadAt { get; set; }
    public bool IsMuted { get; set; }
    public string Presence { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
