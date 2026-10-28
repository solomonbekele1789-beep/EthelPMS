using NGO.PMS.Notifications.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Domain.Entities;

public class NotificationTemplate : AuditableEntity, IMultiTenant
{
    public string EventType { get; private set; } = string.Empty;
    public string TitleTemplateEn { get; private set; } = string.Empty;
    public string BodyTemplateEn { get; private set; } = string.Empty;
    public string? TitleTemplateAm { get; private set; }
    public string? BodyTemplateAm { get; private set; }
    public NotificationChannel DefaultChannel { get; private set; }
    public bool IsActive { get; private set; }
    public Guid TenantId { get; set; }

    private NotificationTemplate() { }

    public static NotificationTemplate Create(
        string eventType,
        string titleTemplateEn,
        string bodyTemplateEn,
        NotificationChannel defaultChannel,
        string? titleTemplateAm = null,
        string? bodyTemplateAm = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(eventType);
        ArgumentException.ThrowIfNullOrWhiteSpace(titleTemplateEn);
        ArgumentException.ThrowIfNullOrWhiteSpace(bodyTemplateEn);

        return new NotificationTemplate
        {
            EventType = eventType,
            TitleTemplateEn = titleTemplateEn,
            BodyTemplateEn = bodyTemplateEn,
            TitleTemplateAm = titleTemplateAm,
            BodyTemplateAm = bodyTemplateAm,
            DefaultChannel = defaultChannel,
            IsActive = true
        };
    }

    public void Update(
        string titleTemplateEn,
        string bodyTemplateEn,
        NotificationChannel defaultChannel,
        string? titleTemplateAm = null,
        string? bodyTemplateAm = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(titleTemplateEn);
        ArgumentException.ThrowIfNullOrWhiteSpace(bodyTemplateEn);

        TitleTemplateEn = titleTemplateEn;
        BodyTemplateEn = bodyTemplateEn;
        TitleTemplateAm = titleTemplateAm;
        BodyTemplateAm = bodyTemplateAm;
        DefaultChannel = defaultChannel;
    }

    public void Deactivate()
    {
        IsActive = false;
    }
}
