using NGO.PMS.Settings.Domain.Enums;
using NGO.PMS.SharedKernel.Domain;

namespace NGO.PMS.Settings.Domain.Entities;

public class SystemSetting : AuditableEntity
{
    public string SettingKey { get; private set; } = string.Empty;
    public string SettingValue { get; private set; } = string.Empty;
    public SettingDataType DataType { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsReadOnly { get; private set; }

    private SystemSetting() { }

    public static SystemSetting Create(
        string settingKey,
        string settingValue,
        SettingDataType dataType,
        string category,
        string description,
        bool isReadOnly = false)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(settingKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(category);

        ValidateValueFormat(settingValue, dataType);

        return new SystemSetting
        {
            SettingKey = settingKey,
            SettingValue = settingValue,
            DataType = dataType,
            Category = category,
            Description = description,
            IsReadOnly = isReadOnly
        };
    }

    public void Update(string settingValue)
    {
        if (IsReadOnly)
            throw new InvalidOperationException($"Setting '{SettingKey}' is read-only and cannot be updated.");

        ValidateValueFormat(settingValue, DataType);
        SettingValue = settingValue;
    }

    private static void ValidateValueFormat(string value, SettingDataType dataType)
    {
        var isValid = dataType switch
        {
            SettingDataType.Integer => int.TryParse(value, out _),
            SettingDataType.Boolean => bool.TryParse(value, out _),
            SettingDataType.Decimal => decimal.TryParse(value, out _),
            SettingDataType.DateTime => DateTimeOffset.TryParse(value, out _),
            SettingDataType.String => true,
            SettingDataType.Json => true,
            _ => true
        };

        if (!isValid)
            throw new ArgumentException($"Value '{value}' is not valid for data type '{dataType}'.");
    }
}
