namespace NGO.PMS.Notifications.Application.DTOs;

public class NotificationTemplateDto
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string TitleTemplateEn { get; set; } = string.Empty;
    public string BodyTemplateEn { get; set; } = string.Empty;
    public string? TitleTemplateAm { get; set; }
    public string? BodyTemplateAm { get; set; }
    public string DefaultChannel { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
}
