using NGO.PMS.Settings.Domain.Enums;
using NGO.PMS.Settings.Domain.Events;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Domain.Entities;

public class OrgSetting : AuditableEntity, ISoftDeletable, IMultiTenant
{
    public Guid OrganizationId { get; set; }
    public string SettingKey { get; private set; } = string.Empty;
    public string SettingValue { get; private set; } = string.Empty;
    public SettingDataType DataType { get; private set; }
    public string? Module { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IMultiTenant
    public Guid TenantId { get; set; }

    private OrgSetting() { }

    public static OrgSetting Create(
        Guid organizationId,
        string settingKey,
        string settingValue,
        SettingDataType dataType,
        string? module,
        string category,
        string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(settingKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(category);

        return new OrgSetting
        {
            OrganizationId = organizationId,
            SettingKey = settingKey,
            SettingValue = settingValue,
            DataType = dataType,
            Module = module,
            Category = category,
            Description = description
        };
    }

    public void Update(string settingValue, SettingDataType dataType)
    {
        SettingValue = settingValue;
        DataType = dataType;

        AddDomainEvent(new OrgSettingChangedEvent(Id, OrganizationId, SettingKey));
    }
}
