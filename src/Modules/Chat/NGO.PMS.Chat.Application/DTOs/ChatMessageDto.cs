namespace NGO.PMS.Chat.Application.DTOs;

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid ChatRoomId { get; set; }
    public Guid SenderUserId { get; set; }
    public string SenderDisplayName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? ParentMessageId { get; set; }
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? Reaction { get; set; }
    public DateTime? EditedAt { get; set; }
    public int ThreadReplyCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
