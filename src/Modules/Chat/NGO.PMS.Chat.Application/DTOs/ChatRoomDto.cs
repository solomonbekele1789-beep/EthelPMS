namespace NGO.PMS.Chat.Application.DTOs;

public class ChatRoomDto
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsActive { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public int ParticipantCount { get; set; }
    public string? LastMessagePreview { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
