namespace NGO.PMS.Settings.Application.DTOs;

public record SystemSettingDto
{
    public Guid Id { get; init; }
    public string SettingKey { get; init; } = string.Empty;
    public string SettingValue { get; init; } = string.Empty;
    public string DataType { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public bool IsReadOnly { get; init; }
}
