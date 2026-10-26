namespace NGO.PMS.Notifications.Application.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid RecipientUserId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? EntityId { get; set; }
    public string? EntityType { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
