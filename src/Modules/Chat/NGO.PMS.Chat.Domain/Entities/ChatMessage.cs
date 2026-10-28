using NGO.PMS.Chat.Domain.Enums;
using NGO.PMS.Chat.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Chat.Domain.Entities;

public class ChatMessage : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid ChatRoomId { get; private set; }
    public Guid SenderUserId { get; private set; }
    public string SenderDisplayName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public MessageStatus Status { get; private set; }
    public Guid? ParentMessageId { get; private set; }
    public string? AttachmentUrl { get; private set; }
    public string? AttachmentName { get; private set; }
    public string? Reaction { get; private set; }
    public DateTime? EditedAt { get; private set; }
    public Guid TenantId { get; set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    private ChatMessage() { }

    public static ChatMessage Create(
        Guid chatRoomId,
        Guid senderUserId,
        string senderDisplayName,
        string content,
        Guid? parentMessageId = null,
        string? attachmentUrl = null,
        string? attachmentName = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        var message = new ChatMessage
        {
            ChatRoomId = chatRoomId,
            SenderUserId = senderUserId,
            SenderDisplayName = senderDisplayName,
            Content = content,
            Status = MessageStatus.Sent,
            ParentMessageId = parentMessageId,
            AttachmentUrl = attachmentUrl,
            AttachmentName = attachmentName
        };

        message.AddDomainEvent(new MessageSentEvent(message.Id, chatRoomId, senderUserId));
        return message;
    }

    public void Edit(string content, Guid editorUserId)
    {
        if (SenderUserId != editorUserId)
            throw new InvalidOperationException("Only the sender can edit this message.");
        ArgumentException.ThrowIfNullOrWhiteSpace(content);

        Content = content;
        EditedAt = DateTime.UtcNow;
    }

    public void Delete(Guid deleterUserId)
    {
        if (SenderUserId != deleterUserId)
            throw new InvalidOperationException("Only the sender can delete this message.");

        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
        Status = MessageStatus.Deleted;
    }

    public void AddReaction(string emoji)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(emoji);

        if (string.IsNullOrEmpty(Reaction))
            Reaction = emoji;
        else
            Reaction = $"{Reaction},{emoji}";
    }

    public void RemoveReaction(string emoji)
    {
        if (string.IsNullOrEmpty(Reaction)) return;

        var reactions = Reaction.Split(',').ToList();
        reactions.Remove(emoji);
        Reaction = reactions.Count > 0 ? string.Join(',', reactions) : null;
    }
}
