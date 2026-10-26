using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Notifications.Domain.Entities;

public class UserNotificationPreference : AuditableEntity, IMultiTenant
{
    public Guid UserId { get; private set; }
    public string EventType { get; private set; } = string.Empty;
    public bool InAppEnabled { get; private set; }
    public bool EmailEnabled { get; private set; }
    public bool PushEnabled { get; private set; }
    public bool SmsEnabled { get; private set; }
    public Guid TenantId { get; set; }

    private UserNotificationPreference() { }

    public static UserNotificationPreference Create(
        Guid userId,
        string eventType,
        bool inAppEnabled = true,
        bool emailEnabled = true,
        bool pushEnabled = false,
        bool smsEnabled = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(eventType);

        return new UserNotificationPreference
        {
            UserId = userId,
            EventType = eventType,
            InAppEnabled = inAppEnabled,
            EmailEnabled = emailEnabled,
            PushEnabled = pushEnabled,
            SmsEnabled = smsEnabled
        };
    }

    public void Update(bool inAppEnabled, bool emailEnabled, bool pushEnabled, bool smsEnabled)
    {
        InAppEnabled = inAppEnabled;
        EmailEnabled = emailEnabled;
        PushEnabled = pushEnabled;
        SmsEnabled = smsEnabled;
    }
}
